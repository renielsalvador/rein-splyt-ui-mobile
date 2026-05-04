create or replace function public.is_joined_member(
  p_event_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.event_members member
    where member.event_id = p_event_id
      and member.user_id = p_user_id
      and member.status = 'joined'
  );
$$;

create or replace function public.can_manage_event(
  p_event_id uuid,
  p_user_id uuid default auth.uid()
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.event_members member
    where member.event_id = p_event_id
      and member.user_id = p_user_id
      and member.status = 'joined'
      and member.role in ('owner', 'admin')
  );
$$;
