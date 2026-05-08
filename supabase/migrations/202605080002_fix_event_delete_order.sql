create or replace function public.delete_event_with_related_records(
  p_event_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fund_ids uuid[];
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.can_manage_event(p_event_id) then
    raise exception 'You do not have permission to delete this event.';
  end if;

  select coalesce(array_agg(id), '{}'::uuid[])
  into v_fund_ids
  from public.central_funds
  where event_id = p_event_id;

  delete from public.expense_splits
  where expense_id in (
    select id
    from public.expenses
    where event_id = p_event_id
  );

  delete from public.central_fund_contributions
  where fund_id = any(v_fund_ids);

  delete from public.expenses
  where event_id = p_event_id;

  delete from public.events
  where id = p_event_id;

  if not found then
    raise exception 'Event not found.';
  end if;
end;
$$;

grant execute on function public.delete_event_with_related_records(uuid) to authenticated;
