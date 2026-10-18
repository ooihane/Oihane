-- Oihane · fase 1: estructura para cuentas vinculadas (2026-10-17)
-- No modifica oihane_backups, oihane_push_* ni datos existentes.
-- No activa invitaciones, migracion de datos ni sincronizacion con la interfaz.

create table public.oihane_partner_links (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','ended')),
  created_at timestamptz not null default now(),
  ended_at timestamptz,
  constraint oihane_partner_distinct_users check (user_a <> user_b),
  constraint oihane_partner_ended_consistency check (
    (status = 'active' and ended_at is null) or
    (status = 'ended' and ended_at is not null)
  )
);
create unique index oihane_partner_unique_active
on public.oihane_partner_links (least(user_a,user_b), greatest(user_a,user_b))
where status = 'active';
create index oihane_partner_user_a on public.oihane_partner_links (user_a) where status = 'active';
create index oihane_partner_user_b on public.oihane_partner_links (user_b) where status = 'active';

create table public.oihane_partner_invitations (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users(id) on delete cascade,
  -- Solo hash; nunca guardar un codigo reutilizable en texto claro.
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_by uuid references auth.users(id),
  accepted_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  constraint oihane_invite_acceptance_consistent check (
    (accepted_by is null and accepted_at is null) or
    (accepted_by is not null and accepted_at is not null)
  ),
  constraint oihane_invite_distinct_users check (
    accepted_by is null or accepted_by <> inviter_id
  ),
  constraint oihane_invite_expiry_future check (expires_at > created_at)
);
create index oihane_invitations_inviter on public.oihane_partner_invitations(inviter_id,created_at desc);

create table public.oihane_shared_records (
  id uuid primary key default gen_random_uuid(),
  link_id uuid references public.oihane_partner_links(id),
  owner_id uuid not null references auth.users(id) on delete cascade,
  module text not null check (module in (
    'compras','hogar','plantas','recetas','viajes','peliculas','series',
    'tareas','calendario','planes','pedidos','wishlist'
  )),
  shared boolean not null default true,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  revision bigint not null default 1 check (revision > 0),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deleted_by uuid references auth.users(id),
  constraint oihane_full_modules_shared check (
    module not in ('compras','hogar','plantas','recetas','viajes','peliculas','series')
    or shared
  ),
  constraint oihane_shared_requires_link check (not shared or link_id is not null),
  constraint oihane_delete_consistent check (
    (deleted_at is null and deleted_by is null) or
    (deleted_at is not null and deleted_by is not null)
  )
);
create index oihane_shared_link_module on public.oihane_shared_records(link_id,module,updated_at desc);
create index oihane_shared_owner on public.oihane_shared_records(owner_id,module);
create index oihane_shared_deleted on public.oihane_shared_records(deleted_at) where deleted_at is not null;

-- Validacion de pertenencia, proteccion de autor y revision monotona.
create function public.oihane_shared_records_guard()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare pair_rec public.oihane_partner_links%rowtype;
begin
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
      or new.link_id is distinct from old.link_id
      or new.owner_id is distinct from old.owner_id
      or new.module is distinct from old.module
      or new.created_at is distinct from old.created_at then
      raise exception 'No es posible reasignar un elemento a otra cuenta o modulo';
    end if;
    if new.revision is distinct from old.revision then
      raise exception 'La revision se controla en el servidor';
    end if;
    new.revision := old.revision + 1;
    new.updated_at := now();
    new.updated_by := (select auth.uid());
    if new.deleted_at is distinct from old.deleted_at then
      if new.deleted_at is null then
        new.deleted_by := null;
      else
        new.deleted_at := now();
        new.deleted_by := (select auth.uid());
      end if;
    else
      new.deleted_by := old.deleted_by;
    end if;
  else
    new.revision := 1;
    new.updated_at := now();
    new.updated_by := (select auth.uid());
    new.deleted_at := null;
    new.deleted_by := null;
  end if;
  if new.link_id is not null then
    select * into pair_rec from public.oihane_partner_links
    where id = new.link_id;
    if not found or new.owner_id not in (pair_rec.user_a,pair_rec.user_b) then
      raise exception 'Elemento ajeno a la vinculacion';
    end if;
    if new.shared and pair_rec.status <> 'active' then
      raise exception 'La vinculacion ya no esta activa';
    end if;
  end if;
  return new;
end;
$$;
create trigger oihane_shared_records_guard_trg
before insert or update on public.oihane_shared_records
for each row execute function public.oihane_shared_records_guard();

-- Notas de compra y regalos privados: nunca se incluyen en el registro de Wishlist.
create table public.oihane_private_gift_details (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_wishlist_record_id uuid references public.oihane_shared_records(id) on delete set null,
  private_data jsonb not null default '{}'::jsonb check(jsonb_typeof(private_data)='object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index oihane_private_gifts_owner on public.oihane_private_gift_details(owner_id);

-- Avisos personales incluso en elementos compartidos.
create table public.oihane_personal_reminders (
  user_id uuid not null references auth.users(id) on delete cascade,
  record_id uuid not null references public.oihane_shared_records(id) on delete cascade,
  enabled boolean not null default false,
  lead_minutes integer not null default 0 check (lead_minutes between 0 and 43200),
  updated_at timestamptz not null default now(),
  primary key (user_id,record_id)
);

-- Solo conflictos de modificaciones concurrentes (no historial general).
create table public.oihane_edit_conflicts (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.oihane_shared_records(id) on delete cascade,
  field_name text not null,
  first_value jsonb,
  second_value jsonb,
  first_user_id uuid references auth.users(id),
  second_user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  resolved_at timestamptz,
  constraint oihane_conflict_max_retention check(
    expires_at > created_at and expires_at <= created_at + interval '90 days'
  )
);
create index oihane_conflicts_expiry on public.oihane_edit_conflicts(expires_at);

-- Todas las tablas nuevas con RLS y permisos explicitamente limitados.
alter table public.oihane_partner_links enable row level security;
alter table public.oihane_partner_invitations enable row level security;
alter table public.oihane_shared_records enable row level security;
alter table public.oihane_private_gift_details enable row level security;
alter table public.oihane_personal_reminders enable row level security;
alter table public.oihane_edit_conflicts enable row level security;

revoke all on public.oihane_partner_links,
 public.oihane_partner_invitations,
 public.oihane_shared_records,
 public.oihane_private_gift_details,
 public.oihane_personal_reminders,
 public.oihane_edit_conflicts
from public, anon, authenticated;

grant select on public.oihane_partner_links to authenticated;
grant select,insert,update on public.oihane_shared_records to authenticated;
grant select,insert,update on public.oihane_private_gift_details to authenticated;
grant select,insert,update,delete on public.oihane_personal_reminders to authenticated;
grant select on public.oihane_edit_conflicts to authenticated;

revoke all on function public.oihane_shared_records_guard() from public, anon, authenticated;

create policy oihane_partner_read on public.oihane_partner_links
for select to authenticated using (
  (select auth.uid()) = user_a or (select auth.uid()) = user_b
);

-- Invitaciones: sin ninguna policy o GRANT para clientes. Solo futuro servidor autorizado.

create policy oihane_records_read on public.oihane_shared_records
for select to authenticated using (
 owner_id = (select auth.uid())
 or (shared and exists(
   select 1 from public.oihane_partner_links p
   where p.id=link_id and p.status='active'
     and (p.user_a=(select auth.uid()) or p.user_b=(select auth.uid()))
 ))
);

create policy oihane_records_insert on public.oihane_shared_records
for insert to authenticated with check (
 owner_id = (select auth.uid()) and (
   (not shared and (link_id is null or exists(
       select 1 from public.oihane_partner_links p
       where p.id=link_id and
         (p.user_a=(select auth.uid()) or p.user_b=(select auth.uid()))
   ))) or
   (shared and exists(
       select 1 from public.oihane_partner_links p
       where p.id=link_id and p.status='active'
         and (p.user_a=(select auth.uid()) or p.user_b=(select auth.uid()))
   ))
 )
);

create policy oihane_records_update on public.oihane_shared_records
for update to authenticated
using (
  owner_id=(select auth.uid())
  or (
    module in ('compras','hogar','plantas','recetas','viajes','peliculas','series','pedidos')
    and shared and exists (
      select 1 from public.oihane_partner_links p
      where p.id=link_id and p.status='active'
        and (p.user_a=(select auth.uid()) or p.user_b=(select auth.uid()))
    )
  )
)
with check (
  owner_id=(select auth.uid())
  or (
    module in ('compras','hogar','plantas','recetas','viajes','peliculas','series','pedidos')
    and shared and exists (
      select 1 from public.oihane_partner_links p
      where p.id=link_id and p.status='active'
        and (p.user_a=(select auth.uid()) or p.user_b=(select auth.uid()))
    )
  )
);
-- No DELETE a usuarios: se usa deleted_at. La purga definitiva se programara despues.

create policy oihane_gifts_read on public.oihane_private_gift_details
for select to authenticated using (owner_id = (select auth.uid()));
create policy oihane_gifts_insert on public.oihane_private_gift_details
for insert to authenticated with check (owner_id = (select auth.uid()));
create policy oihane_gifts_update on public.oihane_private_gift_details
for update to authenticated using (owner_id=(select auth.uid()))
with check (owner_id=(select auth.uid()));

create policy oihane_reminders_read on public.oihane_personal_reminders
for select to authenticated using (user_id=(select auth.uid()));
create policy oihane_reminders_insert on public.oihane_personal_reminders
for insert to authenticated with check (
  user_id=(select auth.uid()) and exists(
    select 1 from public.oihane_shared_records r where r.id=record_id
  )
);
create policy oihane_reminders_update on public.oihane_personal_reminders
for update to authenticated using (user_id=(select auth.uid()))
with check (
  user_id=(select auth.uid()) and exists(
    select 1 from public.oihane_shared_records r where r.id=record_id
  )
);
create policy oihane_reminders_delete on public.oihane_personal_reminders
for delete to authenticated using (user_id=(select auth.uid()));

create policy oihane_conflicts_read on public.oihane_edit_conflicts
for select to authenticated using (
  exists(select 1 from public.oihane_shared_records r where r.id=record_id)
);

comment on table public.oihane_partner_links is 'Solo pareja interna, no un tercer espacio visible';
comment on table public.oihane_partner_invitations is 'Codigos temporales de un uso: solo backend de invitaciones';
comment on table public.oihane_shared_records is 'Datos granulares sin compartir JSON de oihane_backups';
comment on table public.oihane_edit_conflicts is 'Solo conflictos, maximo 90 dias; no historial general';
comment on column public.oihane_shared_records.deleted_at is 'Papelera recuperable; purga tras 30 dias en fase de automatizacion';


-- Oihane 5.36.8: primer módulo compartido operativo, COMPRAS.
-- Aplicado previamente mediante migración en el proyecto Supabase conectado.
-- Seguro al ejecutar repetidamente: conserva copias personales y evita duplicados.
alter table public.oihane_shared_records add column if not exists source_key text;
create unique index if not exists oihane_shared_source_key_uniq
  on public.oihane_shared_records(link_id,module,source_key)
  where link_id is not null and source_key is not null;
insert into public.oihane_shared_records(link_id,owner_id,module,source_key,payload,shared)
select l.id,l.user_a,'compras',l.user_a::text || '|' || coalesce(nullif(item->>'id',''),ord::text),item,true
from public.oihane_partner_links l
join public.oihane_backups b on b.user_id=l.user_a
cross join lateral jsonb_array_elements(
  case when jsonb_typeof(b.data->'data'->'oihane_products')='array'
       then b.data->'data'->'oihane_products' else '[]'::jsonb end
) with ordinality as a(item,ord)
where l.status='active' and jsonb_typeof(item)='object'
on conflict do nothing;
comment on column public.oihane_shared_records.source_key is
  'ID lógico estable del elemento para impedir importaciones duplicadas.';


-- Oihane 5.37.3: migración voluntaria (18-10-2026) de tareas y calendario
-- anteriores. Requiere que la pareja haya aceptado la invitación.
-- Protegemos los eventos generados por Estudio, porque ese módulo es privado.
-- SQL idempotente: no modifica elementos existentes ni copias personales.
with items as (
 select l.id link_id,l.user_a owner_id,'tareas'::text module_key,e.value item,e.ordinality item_pos
 from public.oihane_partner_links l
 join public.oihane_backups b on b.user_id=l.user_a
 cross join lateral jsonb_array_elements(
 case when jsonb_typeof(b.data->'data'->'oihane_tasks')='array'
 then b.data->'data'->'oihane_tasks' else '[]'::jsonb end
 ) with ordinality e
 where l.status='active' and jsonb_typeof(e.value)='object'
 union all
 select l.id,l.user_a,'calendario',e.value,e.ordinality
 from public.oihane_partner_links l
 join public.oihane_backups b on b.user_id=l.user_a
 cross join lateral jsonb_array_elements(
 case when jsonb_typeof(b.data->'data'->'oihane_events')='array'
 then b.data->'data'->'oihane_events' else '[]'::jsonb end
 ) with ordinality e
 where l.status='active' and jsonb_typeof(e.value)='object'
 and coalesce(e.value->>'sourceModule','') <> 'Estudio'
)
insert into public.oihane_shared_records(link_id,owner_id,module,source_key,payload,shared)
select link_id,owner_id,module_key,
 owner_id::text||'|'||coalesce(nullif(item->>'id',''),item_pos::text),
 item - 'notify' - 'notifyLead' - 'departureMinutes' - 'reminder' - 'reminders'
   - '_oihaneSharedId' - '_oihaneSharedSource' - '_oihaneSharedOwner'
   - 'sharedWithPartner',
 true
from items
on conflict do nothing;
