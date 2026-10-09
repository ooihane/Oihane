-- Ejecutar una sola vez en Supabase SQL Editor.
-- RLS limita cada fila al usuario autenticado que la posee.
create table if not exists public.oihane_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.oihane_backups enable row level security;

create policy "Users can read their own Oihane backup"
on public.oihane_backups for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own Oihane backup"
on public.oihane_backups for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own Oihane backup"
on public.oihane_backups for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update on public.oihane_backups to authenticated;
