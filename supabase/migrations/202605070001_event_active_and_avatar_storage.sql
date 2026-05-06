alter table public.events
add column if not exists is_active boolean not null default true;

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
    start_date = coalesce(p_start_date, start_date),
    end_date = coalesce(p_end_date, end_date),
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

drop function if exists public.list_pending_invites_for_email(text);

create function public.list_pending_invites_for_email(
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
  event_is_active boolean,
  event_start_date date,
  event_end_date date,
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
  from public.users as users
  where users.id = auth.uid();

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
    event.is_active,
    event.start_date,
    event.end_date,
    event.created_by,
    event.created_at,
    event.updated_at,
    invited_by_user.display_name,
    invited_by_user.email
  from public.invites as invite
  join public.events as event
    on event.id = invite.event_id
  join public.users as invited_by_user
    on invited_by_user.id = invite.invited_by
  where invite.status = 'pending'
    and lower(trim(invite.invited_email)) = lower(trim(p_email))
  order by invite.created_at desc;
end;
$$;

do $$
begin
  insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;
exception
  when undefined_table then
    null;
end $$;

drop policy if exists "avatar_images_public_read" on storage.objects;
create policy "avatar_images_public_read"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists "avatar_images_upload_own" on storage.objects;
create policy "avatar_images_upload_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = split_part(name, '/', 1)
);

drop policy if exists "avatar_images_update_own" on storage.objects;
create policy "avatar_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid()::text = split_part(name, '/', 1)
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = split_part(name, '/', 1)
);

grant execute on function public.update_event_details(uuid, text, text, text, boolean, date, date) to authenticated;
grant execute on function public.list_pending_invites_for_email(text) to authenticated;
