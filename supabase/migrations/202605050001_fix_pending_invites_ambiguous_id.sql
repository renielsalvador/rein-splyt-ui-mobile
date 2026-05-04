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

  select *
  into v_user
  from public.users as app_user
  where app_user.id = auth.uid();

  if v_user.id is null then
    raise exception 'User profile not found';
  end if;

  if lower(trim(v_user.email)) <> lower(trim(p_email)) then
    raise exception 'Invite lookup email does not match the current user.';
  end if;

  return query
  select
    invite.id as id,
    invite.event_id as event_id,
    invite.invited_by as invited_by,
    invite.invite_code as invite_code,
    invite.invited_email as invited_email,
    invite.status as status,
    invite.expires_at as expires_at,
    invite.created_at as created_at,
    event.name as event_name,
    event.description as event_description,
    event.currency as event_currency,
    event.icon as event_icon,
    event.created_by as event_created_by,
    event.created_at as event_created_at,
    event.updated_at as event_updated_at,
    inviter.display_name as invited_by_display_name,
    inviter.email as invited_by_email
  from public.invites as invite
  join public.events as event on event.id = invite.event_id
  join public.users as inviter on inviter.id = invite.invited_by
  where lower(coalesce(invite.invited_email, '')) = lower(trim(p_email))
    and invite.status = 'pending'
    and invite.expires_at > timezone('utc', now())
  order by invite.created_at desc;
end;
$$;
