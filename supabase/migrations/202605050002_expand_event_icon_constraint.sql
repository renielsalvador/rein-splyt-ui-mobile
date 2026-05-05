do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'events_icon_check'
      and conrelid = 'public.events'::regclass
  ) then
    alter table public.events drop constraint events_icon_check;
  end if;
end $$;

alter table public.events
add constraint events_icon_check
check (
  icon in (
    'event',
    'trip',
    'plane',
    'beach',
    'food',
    'party',
    'work',
    'home',
    'gift',
    'music',
    'camera',
    'sports',
    'shopping',
    'game',
    'study'
  )
);
