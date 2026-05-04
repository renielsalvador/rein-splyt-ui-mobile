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
  v_invite public.invites;
begin
  if auth.uid() is distinct from p_invited_by then
    raise exception 'Authenticated user does not match inviter.';
  end if;

  if not public.can_manage_event(p_event_id, p_invited_by) then
    raise exception 'You are not allowed to invite members to this event.';
  end if;

  if p_invited_user_id is not null then
    select lower(trim(email)) into v_invited_email
    from public.users
    where id = p_invited_user_id;

    if v_invited_email is null then
      raise exception 'Invitee user was not found.';
    end if;
  else
    v_invited_email := nullif(lower(trim(coalesce(p_invited_email, ''))), '');
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

  return v_invite;
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
