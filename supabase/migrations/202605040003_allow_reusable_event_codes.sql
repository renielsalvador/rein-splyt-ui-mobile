create or replace function public.join_event_by_code(
  p_invite_code text
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

  select * into v_user
  from public.users
  where id = auth.uid();

  select * into v_invite
  from public.invites
  where invite_code = upper(trim(p_invite_code))
    and status = 'pending'
    and expires_at > timezone('utc', now())
  limit 1;

  if v_invite.id is null then
    raise exception 'Invite code not found.';
  end if;

  insert into public.event_members (event_id, user_id, display_name, role, status)
  values (v_invite.event_id, auth.uid(), v_user.display_name, 'member', 'joined')
  on conflict do nothing;

  update public.event_members
  set
    status = 'joined',
    display_name = v_user.display_name
  where event_id = v_invite.event_id
    and user_id = auth.uid();

  select * into v_event
  from public.events
  where id = v_invite.event_id;

  return v_event;
end;
$$;
