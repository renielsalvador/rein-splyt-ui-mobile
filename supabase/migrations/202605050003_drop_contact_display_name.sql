delete from public.contacts
where contact_user_id is null;

drop index if exists public.idx_contacts_owner_display_name_placeholder;
drop index if exists public.idx_contacts_owner_display_name;

alter table public.contacts
  drop column if exists display_name;

alter table public.contacts
  alter column contact_user_id set not null;

alter table public.contacts
  drop constraint if exists contacts_contact_user_id_fkey;

alter table public.contacts
  add constraint contacts_contact_user_id_fkey
  foreign key (contact_user_id)
  references public.users (id)
  on delete cascade;

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

  if v_member.id is null or v_member.user_id is null or v_member.status not in ('joined', 'invited') then
    return;
  end if;

  insert into public.contacts (owner_user_id, contact_user_id)
  select
    owner_member.user_id,
    v_member.user_id
  from public.event_members owner_member
  where owner_member.event_id = v_member.event_id
    and owner_member.id <> v_member.id
    and owner_member.user_id is not null
    and owner_member.status = 'joined'
  on conflict (owner_user_id, contact_user_id)
    where contact_user_id is not null
  do nothing;

  if v_member.status = 'joined' then
    insert into public.contacts (owner_user_id, contact_user_id)
    select
      v_member.user_id,
      peer_member.user_id
    from public.event_members peer_member
    where peer_member.event_id = v_member.event_id
      and peer_member.id <> v_member.id
      and peer_member.user_id is not null
      and peer_member.status in ('joined', 'invited')
    on conflict (owner_user_id, contact_user_id)
      where contact_user_id is not null
    do nothing;
  end if;
end;
$$;
