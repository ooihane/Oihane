-- Oihane 5.37.0: base complementaria de módulos y perfiles (idempotente).
-- EJECUTADO en el proyecto Oihane. Conservar migraciones previas.
-- No comparte registros antiguos de Tareas, Calendario, Planes, Pedidos ni Wishlist.

create table if not exists public.oihane_user_profiles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(char_length(trim(display_name)) between 1 and 48),
 updated_at timestamptz not null default now()
);
alter table public.oihane_user_profiles enable row level security;
revoke all on public.oihane_user_profiles from public,anon,authenticated;
grant select,insert,update on public.oihane_user_profiles to authenticated;
drop policy if exists oihane_profile_owner_select on public.oihane_user_profiles;
drop policy if exists oihane_profile_owner_insert on public.oihane_user_profiles;
drop policy if exists oihane_profile_owner_update on public.oihane_user_profiles;
create policy oihane_profile_owner_select on public.oihane_user_profiles
 for select to authenticated using(user_id=(select auth.uid()));
create policy oihane_profile_owner_insert on public.oihane_user_profiles
 for insert to authenticated with check(user_id=(select auth.uid()));
create policy oihane_profile_owner_update on public.oihane_user_profiles
 for update to authenticated using(user_id=(select auth.uid()))
 with check(user_id=(select auth.uid()));

-- Sólo 5 fuentes totalmente compartidas, con la cultura filtrada por tipo.
with source as (
 select l.id link_id,l.user_a owner_id,t.module,t.item,t.ordinality
 from public.oihane_partner_links l
 join public.oihane_backups b on b.user_id=l.user_a
 cross join lateral (
  select 'hogar'::text module,item,ord ordinality
   from jsonb_array_elements(case when jsonb_typeof(b.data->'data'->'oihane_home')='array' then b.data->'data'->'oihane_home' else '[]'::jsonb end) with ordinality as x(item,ord)
  union all select 'plantas',item,ord
   from jsonb_array_elements(case when jsonb_typeof(b.data->'data'->'oihane_plants')='array' then b.data->'data'->'oihane_plants' else '[]'::jsonb end) with ordinality as x(item,ord)
  union all select 'recetas',item,ord
   from jsonb_array_elements(case when jsonb_typeof(b.data->'data'->'oihane_recipes')='array' then b.data->'data'->'oihane_recipes' else '[]'::jsonb end) with ordinality as x(item,ord)
  union all select 'viajes',item,ord
   from jsonb_array_elements(case when jsonb_typeof(b.data->'data'->'oihane_trips')='array' then b.data->'data'->'oihane_trips' else '[]'::jsonb end) with ordinality as x(item,ord)
  union all select 'peliculas',item,ord
   from jsonb_array_elements(case when jsonb_typeof(b.data->'data'->'oihane_culture')='array' then b.data->'data'->'oihane_culture' else '[]'::jsonb end) with ordinality as x(item,ord)
   where lower(coalesce(item->>'kind','')) like '%pel%cula%' or lower(coalesce(item->>'kind','')) like '%serie%'
 ) t
 where l.status='active' and jsonb_typeof(t.item)='object'
)
insert into public.oihane_shared_records(link_id,owner_id,module,source_key,payload,shared)
select link_id,owner_id,module,owner_id::text||'|'||coalesce(nullif(item->>'id',''),ordinality::text),item,true
from source on conflict do nothing;

-- Dos categorías heredadas ya fueron renombradas en Supabase; se conserva el comando.
update public.oihane_shared_records
set payload=jsonb_set(payload,'{category}',to_jsonb('Quesos y embutidos'::text),true)
where module='compras' and payload->>'category' in ('Embutidos','Embutido');
