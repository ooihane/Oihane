-- Respaldo de las funciones instaladas en Supabase. Ejecución de ejemplo.
-- Requiere previamente SUPABASE_CUENTAS_COMPARTIDAS.sql.

CREATE OR REPLACE FUNCTION public.oihane_invite_accept(p_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_me uuid := (select auth.uid());
 v_code text;
 v_inv public.oihane_partner_invitations%rowtype;
 v_link_id uuid;
 v_first uuid;
 v_second uuid;
begin
 if v_me is null or (coalesce((select auth.jwt()->>'is_anonymous'),'false')='true') then
   raise exception 'Inicia sesión en tu propia cuenta';
 end if;
 v_code := upper(trim(coalesce(p_code,'')));
 if v_code !~ '^[A-F0-9]{32}$' then
    raise exception 'Código de invitación no válido';
 end if;
 select * into v_inv from public.oihane_partner_invitations
 where token_hash = encode(sha256(convert_to(v_code,'UTF8')),'hex')
 for update;
 if not found or v_inv.accepted_at is not null or v_inv.cancelled_at is not null or v_inv.expires_at <= now() then
    raise exception 'Invitación caducada, cancelada o no válida';
 end if;
 if v_me=v_inv.inviter_id then
   raise exception 'No puedes vincular tu cuenta contigo mismo';
 end if;
 -- Serializar aceptaciones concurrentes para ambos usuarios.
 v_first:=least(v_me,v_inv.inviter_id);
 v_second:=greatest(v_me,v_inv.inviter_id);
 perform pg_advisory_xact_lock(hashtextextended(v_first::text,0));
 perform pg_advisory_xact_lock(hashtextextended(v_second::text,0));
 if exists(select 1 from public.oihane_partner_links l
           where l.status='active'
             and (v_me in (l.user_a,l.user_b) or v_inv.inviter_id in (l.user_a,l.user_b))) then
   raise exception 'Una de las dos cuentas ya está vinculada';
 end if;
 insert into public.oihane_partner_links(user_a,user_b,status)
 values(v_inv.inviter_id,v_me,'active') returning id into v_link_id;
 update public.oihane_partner_invitations set accepted_by=v_me,accepted_at=now()
 where id=v_inv.id;
 return jsonb_build_object('linked',true,'link_id',v_link_id,'partner_id',v_inv.inviter_id);
end $function$
;

CREATE OR REPLACE FUNCTION public.oihane_invite_cancel(p_invitation_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_me uuid:=(select auth.uid());
begin
 if v_me is null then raise exception 'Inicia sesión para cancelar la invitación'; end if;
 update public.oihane_partner_invitations
 set cancelled_at=now()
 where id=p_invitation_id and inviter_id=v_me and accepted_at is null
 and cancelled_at is null and expires_at>now();
 return found;
end $function$
;

CREATE OR REPLACE FUNCTION public.oihane_invite_create()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_me uuid := (select auth.uid());
 v_code text;
 v_id uuid;
 v_count integer;
begin
 if v_me is null or (coalesce((select auth.jwt()->>'is_anonymous'),'false') = 'true') then
   raise exception 'Inicia sesión en una cuenta personal antes de invitar';
 end if;
 if exists(select 1 from public.oihane_partner_links l
           where l.status='active' and v_me in (l.user_a,l.user_b)) then
   raise exception 'Esta cuenta ya está vinculada';
 end if;
 select count(*) into v_count from public.oihane_partner_invitations i
 where i.inviter_id=v_me and i.created_at>now()-interval '24 hours';
 if v_count>=5 then raise exception 'Límite diario de invitaciones alcanzado'; end if;
 update public.oihane_partner_invitations set cancelled_at=now()
 where inviter_id=v_me and accepted_at is null and cancelled_at is null;
 v_code := upper(replace(gen_random_uuid()::text,'-',''));
 insert into public.oihane_partner_invitations(inviter_id,token_hash,expires_at)
 values(v_me,encode(sha256(convert_to(v_code,'UTF8')),'hex'),now()+interval '24 hours')
 returning id into v_id;
 return jsonb_build_object('invitation_id',v_id,'code',v_code,'expires_in_hours',24);
end $function$
;

revoke all on function public.oihane_invite_create() from public,anon,authenticated;
revoke all on function public.oihane_invite_accept(text) from public,anon,authenticated;
revoke all on function public.oihane_invite_cancel(uuid) from public,anon,authenticated;
grant execute on function public.oihane_invite_create() to authenticated;
grant execute on function public.oihane_invite_accept(text) to authenticated;
grant execute on function public.oihane_invite_cancel(uuid) to authenticated;
