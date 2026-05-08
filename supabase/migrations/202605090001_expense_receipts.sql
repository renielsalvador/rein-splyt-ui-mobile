alter table public.expenses
add column if not exists receipt_url text,
add column if not exists receipt_file_name text,
add column if not exists receipt_content_type text;

do $$
begin
  insert into storage.buckets (id, name, public)
  values ('expense-receipts', 'expense-receipts', true)
  on conflict (id) do nothing;
exception
  when undefined_table then
    null;
end $$;

drop policy if exists "expense_receipts_public_read" on storage.objects;
create policy "expense_receipts_public_read"
on storage.objects
for select
to public
using (bucket_id = 'expense-receipts');

drop policy if exists "expense_receipts_upload_joined_member" on storage.objects;
create policy "expense_receipts_upload_joined_member"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'expense-receipts'
  and public.is_joined_member(split_part(name, '/', 1)::uuid)
);

drop policy if exists "expense_receipts_update_joined_member" on storage.objects;
create policy "expense_receipts_update_joined_member"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'expense-receipts'
  and public.is_joined_member(split_part(name, '/', 1)::uuid)
)
with check (
  bucket_id = 'expense-receipts'
  and public.is_joined_member(split_part(name, '/', 1)::uuid)
);

create or replace function public.create_expense_with_equal_split(
  p_event_id uuid,
  p_title text,
  p_amount numeric,
  p_currency text,
  p_paid_by_member_id uuid,
  p_payment_source text,
  p_participant_member_ids uuid[],
  p_note text default null,
  p_receipt_url text default null,
  p_receipt_file_name text default null,
  p_receipt_content_type text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expense_id uuid;
  v_share numeric(12, 2);
  v_member_id uuid;
  v_member_count integer;
  v_index integer := 0;
  v_total_assigned numeric(12, 2) := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_joined_member(p_event_id) then
    raise exception 'You are not a member of this event.';
  end if;

  v_member_count := coalesce(array_length(p_participant_member_ids, 1), 0);

  if v_member_count = 0 then
    raise exception 'Select at least one participant.';
  end if;

  insert into public.expenses (
    event_id,
    amount,
    currency,
    title,
    note,
    receipt_url,
    receipt_file_name,
    receipt_content_type,
    paid_by_member_id,
    payment_source,
    created_by
  )
  values (
    p_event_id,
    round(p_amount::numeric, 2),
    p_currency,
    trim(p_title),
    nullif(trim(p_note), ''),
    nullif(trim(p_receipt_url), ''),
    nullif(trim(p_receipt_file_name), ''),
    nullif(trim(p_receipt_content_type), ''),
    p_paid_by_member_id,
    p_payment_source,
    auth.uid()
  )
  returning id into v_expense_id;

  v_share := round((p_amount / v_member_count)::numeric, 2);

  foreach v_member_id in array p_participant_member_ids
  loop
    v_index := v_index + 1;

    insert into public.expense_splits (expense_id, member_id, split_type, share_amount)
    values (
      v_expense_id,
      v_member_id,
      'equal',
      case
        when v_index = v_member_count then round((p_amount - v_total_assigned)::numeric, 2)
        else v_share
      end
    );

    if v_index < v_member_count then
      v_total_assigned := round((v_total_assigned + v_share)::numeric, 2);
    end if;
  end loop;

  update public.events
  set updated_at = timezone('utc', now())
  where id = p_event_id;
end;
$$;

create or replace function public.update_expense_with_equal_split(
  p_expense_id uuid,
  p_title text,
  p_amount numeric,
  p_paid_by_member_id uuid,
  p_payment_source text,
  p_participant_member_ids uuid[],
  p_note text default null,
  p_clear_receipt boolean default false,
  p_receipt_url text default null,
  p_receipt_file_name text default null,
  p_receipt_content_type text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_share numeric(12, 2);
  v_member_id uuid;
  v_member_count integer;
  v_index integer := 0;
  v_total_assigned numeric(12, 2) := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select expense.event_id into v_event_id
  from public.expenses expense
  where expense.id = p_expense_id;

  if v_event_id is null then
    raise exception 'Expense not found.';
  end if;

  if not public.is_joined_member(v_event_id) then
    raise exception 'You are not a member of this event.';
  end if;

  v_member_count := coalesce(array_length(p_participant_member_ids, 1), 0);

  if v_member_count = 0 then
    raise exception 'Select at least one participant.';
  end if;

  update public.expenses
  set
    amount = round(p_amount::numeric, 2),
    title = trim(p_title),
    note = nullif(trim(p_note), ''),
    receipt_url = case
      when p_clear_receipt then null
      when nullif(trim(p_receipt_url), '') is not null then nullif(trim(p_receipt_url), '')
      else receipt_url
    end,
    receipt_file_name = case
      when p_clear_receipt then null
      when nullif(trim(p_receipt_url), '') is not null then nullif(trim(p_receipt_file_name), '')
      else receipt_file_name
    end,
    receipt_content_type = case
      when p_clear_receipt then null
      when nullif(trim(p_receipt_url), '') is not null then nullif(trim(p_receipt_content_type), '')
      else receipt_content_type
    end,
    paid_by_member_id = p_paid_by_member_id,
    payment_source = p_payment_source
  where id = p_expense_id;

  delete from public.expense_splits
  where expense_id = p_expense_id;

  v_share := round((p_amount / v_member_count)::numeric, 2);

  foreach v_member_id in array p_participant_member_ids
  loop
    v_index := v_index + 1;

    insert into public.expense_splits (expense_id, member_id, split_type, share_amount)
    values (
      p_expense_id,
      v_member_id,
      'equal',
      case
        when v_index = v_member_count
          then round((p_amount - v_total_assigned)::numeric, 2)
        else v_share
      end
    );

    if v_index < v_member_count then
      v_total_assigned := round((v_total_assigned + v_share)::numeric, 2);
    end if;
  end loop;
end;
$$;

grant execute on function public.create_expense_with_equal_split(uuid, text, numeric, text, uuid, text, uuid[], text, text, text, text) to authenticated;
grant execute on function public.update_expense_with_equal_split(uuid, text, numeric, uuid, text, uuid[], text, boolean, text, text, text) to authenticated;
