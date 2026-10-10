-- Oihane 5.29 — esquema de sincronización privada
-- Ejecuta este archivo en Supabase > SQL Editor > New query.
-- No pegues aquí ni en Oihane una clave service_role.
create table if not exists public.oihane_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.oihane_backups enable row level security;
revoke all on table public.oihane_backups from anon;
grant select, insert, update on table public.oihane_backups to authenticated;
drop policy if exists "Users can read their own Oihane data" on public.oihane_backups;
create policy "Users can read their own Oihane data" on public.oihane_backups for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can create their own Oihane data" on public.oihane_backups;
create policy "Users can create their own Oihane data" on public.oihane_backups for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update their own Oihane data" on public.oihane_backups;
create policy "Users can update their own Oihane data" on public.oihane_backups for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
