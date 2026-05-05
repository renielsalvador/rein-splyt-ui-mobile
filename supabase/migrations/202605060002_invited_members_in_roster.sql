create or replace function public.create_event_invite(
  p_event_id uuid,
  p_invited_by uuid,
  p_invite_code text,
  p_invited_email text default null,
  p_invited_user_id uuid default null,
  p_expires_at timestamptz default timezone('utc', now()) + interval '7 days'
)
returns public.invites
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invited_email text;
  v_invited_display_name text;
  v_invite public.invites;
  v_member public.event_members;
begin
  if auth.uid() is distinct from p_invited_by then
    raise exception 'Authenticated user does not match inviter.';
  end if;

  if not public.can_manage_event(p_event_id, p_invited_by) then
    raise exception 'You are not allowed to invite members to this event.';
  end if;

  if p_invited_user_id is not null then
    select lower(trim(email)), display_name
    into v_invited_email, v_invited_display_name
    from public.users
    where id = p_invited_user_id;

    if v_invited_email is null then
      raise exception 'Invitee user was not found.';
    end if;
  else
    v_invited_email := nullif(lower(trim(coalesce(p_invited_email, ''))), '');
    v_invited_display_name := coalesce(v_invited_email, 'Invited member');
  end if;

  insert into public.invites (
    event_id,
    invited_by,
    invite_code,
    invited_email,
    status,
    expires_at
  )
  values (
    p_event_id,
    p_invited_by,
    upper(trim(p_invite_code)),
    v_invited_email,
    'pending',
    p_expires_at
  )
  returning * into v_invite;

  select *
  into v_member
  from public.event_members
  where event_id = p_event_id
    and (
      (p_invited_user_id is not null and user_id = p_invited_user_id)
      or (
        p_invited_user_id is null
        and user_id is null
        and lower(display_name) = lower(v_invited_display_name)
      )
    )
  order by joined_at asc
  limit 1;

  if v_member.id is null then
    insert into public.event_members (
      event_id,
      user_id,
      display_name,
      role,
      status
    )
    values (
      p_event_id,
      p_invited_user_id,
      v_invited_display_name,
      'member',
      'invited'
    );
  elsif v_member.status <> 'joined' then
    update public.event_members
    set
      user_id = coalesce(v_member.user_id, p_invited_user_id),
      display_name = v_invited_display_name,
      status = 'invited'
    where id = v_member.id;
  end if;

  return v_invite;
end;
$$;

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
  v_member public.event_members;
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

  select *
  into v_member
  from public.event_members
  where event_id = v_invite.event_id
    and (
      user_id = auth.uid()
      or (
        user_id is null
        and lower(display_name) = lower(coalesce(v_invite.invited_email, ''))
      )
    )
  order by case when user_id = auth.uid() then 0 else 1 end, joined_at asc
  limit 1;

  if v_member.id is null then
    insert into public.event_members (event_id, user_id, display_name, role, status)
    values (v_invite.event_id, auth.uid(), v_user.display_name, 'member', 'joined');
  else
    update public.event_members
    set
      user_id = coalesce(v_member.user_id, auth.uid()),
      status = 'joined',
      display_name = v_user.display_name
    where id = v_member.id;
  end if;

  select * into v_event
  from public.events
  where id = v_invite.event_id;

  return v_event;
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
  v_member public.event_members;
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

  select *
  into v_member
  from public.event_members
  where event_id = v_invite.event_id
    and (
      user_id = auth.uid()
      or (
        user_id is null
        and lower(display_name) = lower(coalesce(v_invite.invited_email, ''))
      )
    )
  order by case when user_id = auth.uid() then 0 else 1 end, joined_at asc
  limit 1;

  if v_member.id is null then
    insert into public.event_members (event_id, user_id, display_name, role, status)
    values (v_invite.event_id, auth.uid(), v_user.display_name, 'member', 'joined');
  else
    update public.event_members
    set
      user_id = coalesce(v_member.user_id, auth.uid()),
      display_name = v_user.display_name,
      status = 'joined'
    where id = v_member.id;
  end if;

  update public.invites
  set status = 'accepted'
  where id = v_invite.id;

  select * into v_event
  from public.events
  where id = v_invite.event_id;

  return v_event;
end;
$$;

grant execute on function public.create_event_invite(
  uuid,
  uuid,
  text,
  text,
  uuid,
  timestamptz
) to authenticated;

grant execute on function public.join_event_by_code(text) to authenticated;

grant execute on function public.respond_to_event_invite(uuid, text) to authenticated;
