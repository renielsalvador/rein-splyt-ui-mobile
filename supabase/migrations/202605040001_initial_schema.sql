create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null check (char_length(trim(display_name)) > 0),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  description text,
  currency text not null check (currency in ('USD', 'PHP')),
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.event_members (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  display_name text not null check (char_length(trim(display_name)) > 0),
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  status text not null check (status in ('invited', 'joined', 'declined', 'removed')),
  joined_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  invited_by uuid not null references public.users (id) on delete restrict,
  invite_code text not null unique,
  invited_email text,
  status text not null check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null check (currency in ('USD', 'PHP')),
  title text not null check (char_length(trim(title)) > 0),
  note text,
  paid_by_member_id uuid not null references public.event_members (id) on delete restrict,
  payment_source text not null check (payment_source in ('personal', 'central_fund')),
  created_by uuid not null references public.users (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  member_id uuid not null references public.event_members (id) on delete restrict,
  split_type text not null check (split_type = 'equal'),
  share_amount numeric(12, 2) not null check (share_amount >= 0)
);

create table if not exists public.central_funds (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  currency text not null check (currency in ('USD', 'PHP')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.central_fund_contributions (
  id uuid primary key default gen_random_uuid(),
  fund_id uuid not null references public.central_funds (id) on delete cascade,
  member_id uuid not null references public.event_members (id) on delete restrict,
  amount numeric(12, 2) not null check (amount > 0),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_event_members_event_id on public.event_members (event_id);
create index if not exists idx_event_members_user_id on public.event_members (user_id);
create unique index if not exists idx_event_members_unique_event_user
on public.event_members (event_id, user_id)
where user_id is not null;
create index if not exists idx_invites_event_id on public.invites (event_id);
create index if not exists idx_expenses_event_id on public.expenses (event_id);
create index if not exists idx_expense_splits_expense_id on public.expense_splits (expense_id);
create index if not exists idx_expense_splits_member_id on public.expense_splits (member_id);
create index if not exists idx_contributions_fund_id on public.central_fund_contributions (fund_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
before update on public.expenses
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = excluded.display_name;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

create or replace function public.is_joined_member(p_event_id uuid, p_user_id uuid default auth.uid())
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

create or replace function public.can_manage_event(p_event_id uuid, p_user_id uuid default auth.uid())
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

alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.event_members enable row level security;
alter table public.invites enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;
alter table public.central_funds enable row level security;
alter table public.central_fund_contributions enable row level security;

create policy "users_select_own_profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

create policy "users_update_own_profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "events_select_joined_member"
on public.events
for select
to authenticated
using (public.is_joined_member(id));

create policy "event_members_select_joined_member"
on public.event_members
for select
to authenticated
using (public.is_joined_member(event_id));

create policy "event_members_insert_manager"
on public.event_members
for insert
to authenticated
with check (public.can_manage_event(event_id));

create policy "invites_select_joined_member"
on public.invites
for select
to authenticated
using (public.is_joined_member(event_id));

create policy "invites_insert_manager"
on public.invites
for insert
to authenticated
with check (
  public.can_manage_event(event_id)
  and invited_by = auth.uid()
);

create policy "expenses_select_joined_member"
on public.expenses
for select
to authenticated
using (public.is_joined_member(event_id));

create policy "expense_splits_select_joined_member"
on public.expense_splits
for select
to authenticated
using (
  exists (
    select 1
    from public.expenses expense
    where expense.id = expense_id
      and public.is_joined_member(expense.event_id)
  )
);

create policy "central_funds_select_joined_member"
on public.central_funds
for select
to authenticated
using (public.is_joined_member(event_id));

create policy "contributions_select_joined_member"
on public.central_fund_contributions
for select
to authenticated
using (
  exists (
    select 1
    from public.central_funds fund
    where fund.id = fund_id
      and public.is_joined_member(fund.event_id)
  )
);

create or replace function public.create_event_with_owner(
  p_name text,
  p_description text,
  p_currency text
)
returns public.events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.users;
  v_event public.events;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into v_user
  from public.users
  where id = auth.uid();

  if v_user.id is null then
    raise exception 'User profile not found';
  end if;

  insert into public.events (name, description, currency, created_by)
  values (trim(p_name), nullif(trim(p_description), ''), p_currency, auth.uid())
  returning * into v_event;

  insert into public.event_members (event_id, user_id, display_name, role, status)
  values (v_event.id, auth.uid(), v_user.display_name, 'owner', 'joined');

  insert into public.central_funds (event_id, name, currency)
  values (v_event.id, v_event.name || ' Fund', v_event.currency);

  return v_event;
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

  update public.invites
  set status = 'accepted'
  where id = v_invite.id;

  select * into v_event
  from public.events
  where id = v_invite.event_id;

  return v_event;
end;
$$;

create or replace function public.create_expense_with_equal_split(
  p_event_id uuid,
  p_title text,
  p_amount numeric,
  p_currency text,
  p_paid_by_member_id uuid,
  p_payment_source text,
  p_participant_member_ids uuid[],
  p_note text default null
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

create or replace function public.add_central_fund_contribution(
  p_event_id uuid,
  p_member_id uuid,
  p_amount numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_fund_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_joined_member(p_event_id) then
    raise exception 'You are not a member of this event.';
  end if;

  select id into v_fund_id
  from public.central_funds
  where event_id = p_event_id;

  if v_fund_id is null then
    raise exception 'Fund not found.';
  end if;

  insert into public.central_fund_contributions (fund_id, member_id, amount)
  values (v_fund_id, p_member_id, round(p_amount::numeric, 2));
end;
$$;

create or replace function public.get_event_balances(
  p_event_id uuid
)
returns table (
  member_id uuid,
  display_name text,
  paid numeric,
  owed numeric,
  net numeric
)
language sql
security definer
stable
set search_path = public
as $$
  with members as (
    select
      member.id,
      member.display_name
    from public.event_members member
    where member.event_id = p_event_id
  ),
  contribution_paid as (
    select
      contribution.member_id,
      sum(contribution.amount) as total_paid
    from public.central_fund_contributions contribution
    join public.central_funds fund on fund.id = contribution.fund_id
    where fund.event_id = p_event_id
    group by contribution.member_id
  ),
  personal_expense_paid as (
    select
      expense.paid_by_member_id as member_id,
      sum(expense.amount) as total_paid
    from public.expenses expense
    where expense.event_id = p_event_id
      and expense.payment_source = 'personal'
    group by expense.paid_by_member_id
  ),
  owed_totals as (
    select
      split.member_id,
      sum(split.share_amount) as total_owed
    from public.expense_splits split
    join public.expenses expense on expense.id = split.expense_id
    where expense.event_id = p_event_id
    group by split.member_id
  )
  select
    members.id as member_id,
    members.display_name,
    round((coalesce(contribution_paid.total_paid, 0) + coalesce(personal_expense_paid.total_paid, 0))::numeric, 2) as paid,
    round(coalesce(owed_totals.total_owed, 0)::numeric, 2) as owed,
    round((
      coalesce(contribution_paid.total_paid, 0)
      + coalesce(personal_expense_paid.total_paid, 0)
      - coalesce(owed_totals.total_owed, 0)
    )::numeric, 2) as net
  from members
  left join contribution_paid on contribution_paid.member_id = members.id
  left join personal_expense_paid on personal_expense_paid.member_id = members.id
  left join owed_totals on owed_totals.member_id = members.id
  order by net desc, members.display_name asc;
$$;

create or replace function public.get_settlement_plan(
  p_event_id uuid
)
returns table (
  from_member_id uuid,
  from_display_name text,
  to_member_id uuid,
  to_display_name text,
  amount numeric
)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  creditor_ids uuid[];
  creditor_names text[];
  creditor_amounts numeric[];
  debtor_ids uuid[];
  debtor_names text[];
  debtor_amounts numeric[];
  creditor_index integer := 1;
  debtor_index integer := 1;
  max_creditors integer := 0;
  max_debtors integer := 0;
  next_amount numeric(12, 2);
begin
  select
    array_agg(balance.member_id),
    array_agg(balance.display_name),
    array_agg(balance.net)
  into creditor_ids, creditor_names, creditor_amounts
  from public.get_event_balances(p_event_id) balance
  where balance.net > 0;

  select
    array_agg(balance.member_id),
    array_agg(balance.display_name),
    array_agg(abs(balance.net))
  into debtor_ids, debtor_names, debtor_amounts
  from public.get_event_balances(p_event_id) balance
  where balance.net < 0;

  max_creditors := coalesce(array_length(creditor_ids, 1), 0);
  max_debtors := coalesce(array_length(debtor_ids, 1), 0);

  while creditor_index <= max_creditors and debtor_index <= max_debtors
  loop
    next_amount := round(least(creditor_amounts[creditor_index], debtor_amounts[debtor_index])::numeric, 2);

    if next_amount > 0 then
      from_member_id := debtor_ids[debtor_index];
      from_display_name := debtor_names[debtor_index];
      to_member_id := creditor_ids[creditor_index];
      to_display_name := creditor_names[creditor_index];
      amount := next_amount;
      return next;
    end if;

    creditor_amounts[creditor_index] := round((creditor_amounts[creditor_index] - next_amount)::numeric, 2);
    debtor_amounts[debtor_index] := round((debtor_amounts[debtor_index] - next_amount)::numeric, 2);

    if creditor_amounts[creditor_index] = 0 then
      creditor_index := creditor_index + 1;
    end if;

    if debtor_amounts[debtor_index] = 0 then
      debtor_index := debtor_index + 1;
    end if;
  end loop;
end;
$$;

grant execute on function public.create_event_with_owner(text, text, text) to authenticated;
grant execute on function public.join_event_by_code(text) to authenticated;
grant execute on function public.create_expense_with_equal_split(uuid, text, numeric, text, uuid, text, uuid[], text) to authenticated;
grant execute on function public.add_central_fund_contribution(uuid, uuid, numeric) to authenticated;
grant execute on function public.get_event_balances(uuid) to authenticated;
grant execute on function public.get_settlement_plan(uuid) to authenticated;
