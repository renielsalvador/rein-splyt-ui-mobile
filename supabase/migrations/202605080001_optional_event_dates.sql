alter table public.events
alter column start_date drop not null,
alter column end_date drop not null;

alter table public.events
drop constraint if exists events_date_range_check;

alter table public.events
add constraint events_date_range_check
check (
  (
    start_date is null
    and end_date is null
  )
  or (
    start_date is not null
    and end_date is not null
    and start_date <= end_date
  )
);

create or replace function public.create_event_with_owner(
  p_name text,
  p_description text default null,
  p_currency text default 'PHP',
  p_icon text default 'event',
  p_start_date date default null,
  p_end_date date default null
)
returns public.events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.events (
    name,
    description,
    currency,
    icon,
    start_date,
    end_date,
    created_by
  )
  values (
    trim(p_name),
    nullif(trim(p_description), ''),
    p_currency,
    coalesce(nullif(trim(p_icon), ''), 'event'),
    p_start_date,
    p_end_date,
    auth.uid()
  )
  returning * into v_event;

  insert into public.event_members (
    event_id,
    user_id,
    display_name,
    role,
    status
  )
  values (
    v_event.id,
    auth.uid(),
    (select display_name from public.users where id = auth.uid()),
    'owner',
    'joined'
  );

  insert into public.central_funds (
    event_id,
    name,
    currency
  )
  values (
    v_event.id,
    v_event.name || ' Fund',
    v_event.currency
  );

  return v_event;
end;
$$;

create or replace function public.update_event_details(
  p_event_id uuid,
  p_name text,
  p_description text default null,
  p_icon text default 'event',
  p_is_active boolean default null,
  p_start_date date default null,
  p_end_date date default null
)
returns public.events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.can_manage_event(p_event_id) then
    raise exception 'You do not have permission to update this event.';
  end if;

  update public.events
  set
    name = trim(p_name),
    description = nullif(trim(p_description), ''),
    icon = coalesce(nullif(trim(p_icon), ''), 'event'),
    is_active = coalesce(p_is_active, is_active),
    start_date = p_start_date,
    end_date = p_end_date,
    updated_at = timezone('utc', now())
  where id = p_event_id
  returning * into v_event;

  if v_event.id is null then
    raise exception 'Event not found.';
  end if;

  update public.central_funds
  set name = v_event.name || ' Fund'
  where event_id = p_event_id;

  return v_event;
end;
$$;

grant execute on function public.create_event_with_owner(text, text, text, text, date, date) to authenticated;
grant execute on function public.update_event_details(uuid, text, text, text, boolean, date, date) to authenticated;
