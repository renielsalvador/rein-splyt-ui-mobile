create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users (id) on delete cascade,
  contact_user_id uuid references public.users (id) on delete set null,
  display_name text not null check (char_length(trim(display_name)) >= 2),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_contacts_owner_contact_user
on public.contacts (owner_user_id, contact_user_id)
where contact_user_id is not null;

create unique index if not exists idx_contacts_owner_display_name_placeholder
on public.contacts (owner_user_id, lower(trim(display_name)))
where contact_user_id is null;

create index if not exists idx_contacts_owner_display_name
on public.contacts (owner_user_id, lower(trim(display_name)));

create or replace function public.sync_contacts_for_event_member(
  p_member_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.event_members;
begin
  select * into v_member
  from public.event_members
  where id = p_member_id;

  if v_member.id is null then
    return;
  end if;

  if trim(v_member.display_name) = '' or v_member.status not in ('joined', 'invited') then
    return;
  end if;

  insert into public.contacts (owner_user_id, contact_user_id, display_name)
  select
    owner_member.user_id,
    v_member.user_id,
    v_member.display_name
  from public.event_members owner_member
  where owner_member.event_id = v_member.event_id
    and owner_member.id <> v_member.id
    and owner_member.user_id is not null
    and owner_member.status = 'joined'
  on conflict (owner_user_id, contact_user_id)
    where contact_user_id is not null
  do update
  set display_name = excluded.display_name;

  insert into public.contacts (owner_user_id, contact_user_id, display_name)
  select
    owner_member.user_id,
    null,
    v_member.display_name
  from public.event_members owner_member
  where owner_member.event_id = v_member.event_id
    and owner_member.id <> v_member.id
    and owner_member.user_id is not null
    and owner_member.status = 'joined'
    and v_member.user_id is null
  on conflict (owner_user_id, lower(trim(display_name)))
    where contact_user_id is null
  do update
  set display_name = excluded.display_name;

  if v_member.user_id is not null and v_member.status = 'joined' then
    insert into public.contacts (owner_user_id, contact_user_id, display_name)
    select
      v_member.user_id,
      peer_member.user_id,
      peer_member.display_name
    from public.event_members peer_member
    where peer_member.event_id = v_member.event_id
      and peer_member.id <> v_member.id
      and peer_member.user_id is not null
      and peer_member.status in ('joined', 'invited')
      and trim(peer_member.display_name) <> ''
    on conflict (owner_user_id, contact_user_id)
      where contact_user_id is not null
    do update
    set display_name = excluded.display_name;

    insert into public.contacts (owner_user_id, contact_user_id, display_name)
    select
      v_member.user_id,
      null,
      peer_member.display_name
    from public.event_members peer_member
    where peer_member.event_id = v_member.event_id
      and peer_member.id <> v_member.id
      and peer_member.user_id is null
      and peer_member.status in ('joined', 'invited')
      and trim(peer_member.display_name) <> ''
    on conflict (owner_user_id, lower(trim(display_name)))
      where contact_user_id is null
    do update
    set display_name = excluded.display_name;
  end if;
end;
$$;

create or replace function public.set_contacts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_contacts_updated_at on public.contacts;
create trigger set_contacts_updated_at
before update on public.contacts
for each row
execute function public.set_contacts_updated_at();

create or replace function public.handle_event_member_contact_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_contacts_for_event_member(new.id);
  return new;
end;
$$;

drop trigger if exists event_members_sync_contacts on public.event_members;
create trigger event_members_sync_contacts
after insert or update of user_id, display_name, status on public.event_members
for each row
execute function public.handle_event_member_contact_sync();

do $$
declare
  v_member record;
begin
  for v_member in
    select id
    from public.event_members
    where status in ('joined', 'invited')
      and trim(display_name) <> ''
  loop
    perform public.sync_contacts_for_event_member(v_member.id);
  end loop;
end;
$$;

alter table public.contacts enable row level security;

create policy "contacts_select_owner"
on public.contacts
for select
using (owner_user_id = auth.uid());

create policy "contacts_insert_owner"
on public.contacts
for insert
with check (owner_user_id = auth.uid());

create policy "contacts_update_owner"
on public.contacts
for update
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());
