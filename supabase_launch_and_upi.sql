-- Run in Supabase SQL editor to support launch sync + UPI verification

-- Platform launch flag (readable by everyone, writable by authenticated admins via service role API)
create table if not exists public.platform_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table public.platform_settings enable row level security;

drop policy if exists "Anyone can read platform settings" on public.platform_settings;
create policy "Anyone can read platform settings"
  on public.platform_settings for select
  using (true);

-- Optional client-side writes (API with service role is preferred)
drop policy if exists "Authenticated can upsert platform settings" on public.platform_settings;
create policy "Authenticated can upsert platform settings"
  on public.platform_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

insert into public.platform_settings (key, value)
values ('is_launched', 'false')
on conflict (key) do nothing;

-- UPI verification columns on profiles
alter table public.profiles
  add column if not exists upi_verified boolean default false;

alter table public.profiles
  add column if not exists upi_verified_at timestamptz;

-- Enable realtime for cross-device launch updates
alter publication supabase_realtime add table public.platform_settings;
