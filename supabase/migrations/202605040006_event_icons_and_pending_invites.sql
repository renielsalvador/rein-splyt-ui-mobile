alter table public.events
add column if not exists icon text not null default 'event';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'invites_status_check'
      and conrelid = 'public.invites'::regclass
  ) then
    alter table public.invites drop constraint invites_status_check;
  end if;
end $$;

alter table public.invites
add constraint invites_status_check
check (status in ('pending', 'accepted', 'declined', 'expired', 'revoked'));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'events_icon_check'
      and conrelid = 'public.events'::regclass
  ) then
    alter table public.events
    add constraint events_icon_check
    check (icon in ('event', 'trip', 'plane', 'beach', 'food', 'party', 'work', 'home', 'gift'));
  end if;
end $$;

create or replace function public.create_event_with_owner(
  p_name text,
  p_description text,
  p_currency text,
  p_icon text default 'event'
)
returns public.events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
  v_event public.events;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_user
  from public.users
  where id = auth.uid();

  if v_user.id is null then
    raise exception 'User profile not found';
  end if;

  insert into public.events (name, description, currency, icon, created_by)
  values (
    trim(p_name),
    nullif(trim(p_description), ''),
    p_currency,
    coalesce(nullif(trim(p_icon), ''), 'event'),
    auth.uid()
  )
  returning * into v_event;

  insert into public.event_members (event_id, user_id, display_name, role, status)
  values (v_event.id, auth.uid(), v_user.display_name, 'owner', 'joined');

  insert into public.central_funds (event_id, name, currency)
  values (v_event.id, v_event.name || ' Fund', v_event.currency);

  return v_event;
end;
$$;

create or replace function public.list_pending_invites_for_email(
  p_email text
)
returns table (
  id uuid,
  event_id uuid,
  invited_by uuid,
  invite_code text,
  invited_email text,
  status text,
  expires_at timestamptz,
  created_at timestamptz,
  event_name text,
  event_description text,
  event_currency text,
  event_icon text,
  event_created_by uuid,
  event_created_at timestamptz,
  event_updated_at timestamptz,
  invited_by_display_name text,
  invited_by_email text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_user
  from public.users
  where id = auth.uid();

  if v_user.id is null then
    raise exception 'User profile not found';
  end if;

  if lower(trim(v_user.email)) <> lower(trim(p_email)) then
    raise exception 'Invite lookup email does not match the current user.';
  end if;

  return query
  select
    invite.id,
    invite.event_id,
    invite.invited_by,
    invite.invite_code,
    invite.invited_email,
    invite.status,
    invite.expires_at,
    invite.created_at,
    event.name,
    event.description,
    event.currency,
    event.icon,
    event.created_by,
    event.created_at,
    event.updated_at,
    inviter.display_name,
    inviter.email
  from public.invites invite
  join public.events event on event.id = invite.event_id
  join public.users inviter on inviter.id = invite.invited_by
  where lower(coalesce(invite.invited_email, '')) = lower(trim(p_email))
    and invite.status = 'pending'
    and invite.expires_at > timezone('utc', now())
  order by invite.created_at desc;
end;
$$;

create or replace function public.respond_to_event_invite(
  p_invite_id uuid,
  p_action text
)
returns public.events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
  v_invite public.invites;
  v_event public.events;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if p_action not in ('accept', 'decline') then
    raise exception 'Unsupported invite action.';
  end if;

  select * into v_user
  from public.users
  where id = auth.uid();

  if v_user.id is null then
    raise exception 'User profile not found';
  end if;

  select * into v_invite
  from public.invites
  where id = p_invite_id
    and status = 'pending'
    and expires_at > timezone('utc', now())
  limit 1;

  if v_invite.id is null then
    raise exception 'Invite is no longer available.';
  end if;

  if lower(coalesce(v_invite.invited_email, '')) <> lower(v_user.email) then
    raise exception 'This invite belongs to a different email address.';
  end if;

  if p_action = 'decline' then
    update public.invites
    set status = 'declined'
    where id = v_invite.id;

    return null;
  end if;

  insert into public.event_members (event_id, user_id, display_name, role, status)
  values (v_invite.event_id, auth.uid(), v_user.display_name, 'member', 'joined')
  on conflict (event_id, user_id)
  where user_id is not null
  do update
  set
    display_name = excluded.display_name,
    status = 'joined';

  update public.invites
  set status = 'accepted'
  where id = v_invite.id;

  select * into v_event
  from public.events
  where id = v_invite.event_id;

  return v_event;
end;
$$;
