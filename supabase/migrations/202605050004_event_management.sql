create or replace function public.update_event_details(
  p_event_id uuid,
  p_name text,
  p_description text default null,
  p_icon text default 'event'
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

create or replace function public.delete_event_with_related_records(
  p_event_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.can_manage_event(p_event_id) then
    raise exception 'You do not have permission to delete this event.';
  end if;

  delete from public.events
  where id = p_event_id;

  if not found then
    raise exception 'Event not found.';
  end if;
end;
$$;

grant execute on function public.update_event_details(uuid, text, text, text) to authenticated;
grant execute on function public.delete_event_with_related_records(uuid) to authenticated;
