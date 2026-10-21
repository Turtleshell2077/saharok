-- СахарОК: таблица для онлайн-сохранения.
-- Выполнить один раз: Supabase → SQL Editor → New query → вставить → Run.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  cal_token  text unique,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- Каждый пользователь видит и меняет только свою строку.
drop policy if exists own_select on public.user_data;
drop policy if exists own_insert on public.user_data;
drop policy if exists own_update on public.user_data;
drop policy if exists own_delete on public.user_data;

create policy own_select on public.user_data for select using (auth.uid() = user_id);
create policy own_insert on public.user_data for insert with check (auth.uid() = user_id);
create policy own_update on public.user_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_delete on public.user_data for delete using (auth.uid() = user_id);

grant select, insert, update, delete on public.user_data to authenticated;
