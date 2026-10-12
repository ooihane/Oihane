-- Oihane 5.29.4 — seguridad y tablas para Web Push.
-- Ejecutar en Supabase > SQL Editor como propietario del proyecto.
-- No pegar claves privadas ni service_role en este archivo.

-- Refuerza el aislamiento de la copia de Oihane por usuario autenticado.
alter table public.oihane_backups enable row level security;
revoke all on table public.oihane_backups from anon;
grant select, insert, update on table public.oihane_backups to authenticated;
drop policy if exists "Users can read their own Oihane data" on public.oihane_backups;
create policy "Users can read their own Oihane data" on public.oihane_backups for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can create their own Oihane data" on public.oihane_backups;
create policy "Users can create their own Oihane data" on public.oihane_backups for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update their own Oihane data" on public.oihane_backups;
create policy "Users can update their own Oihane data" on public.oihane_backups for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.oihane_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  timezone text not null default 'Europe/Madrid',
  created_at timestamptz not null default now(),
  constraint oihane_push_user_endpoint_unique unique (user_id, endpoint)
);
alter table public.oihane_push_subscriptions enable row level security;
revoke all on table public.oihane_push_subscriptions from anon;
grant select, insert, update, delete on table public.oihane_push_subscriptions to authenticated;
drop policy if exists "Users manage own Oihane push subscriptions" on public.oihane_push_subscriptions;
create policy "Users manage own Oihane push subscriptions" on public.oihane_push_subscriptions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Deduplication log used only by the server function; browser users get no table privileges.
create table if not exists public.oihane_push_sent (
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_key text not null,
  fire_date text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, reminder_key, fire_date)
);
alter table public.oihane_push_sent enable row level security;
revoke all on table public.oihane_push_sent from anon, authenticated;
grant all on table public.oihane_push_sent to service_role;

-- Read-only security audit: should report RLS enabled for all three tables.
select n.nspname as schema_name, c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('oihane_backups','oihane_push_subscriptions','oihane_push_sent')
order by c.relname;
