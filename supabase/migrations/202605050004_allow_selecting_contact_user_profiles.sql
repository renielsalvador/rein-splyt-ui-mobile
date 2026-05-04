create policy "users_select_contact_profiles"
on public.users
for select
to authenticated
using (
  exists (
    select 1
    from public.contacts
    where contacts.owner_user_id = auth.uid()
      and contacts.contact_user_id = users.id
  )
);
