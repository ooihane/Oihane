-- Ejecutar solo DESPUÉS de desplegar la función dispatch-push y crear los 3 secretos en Supabase Vault:
-- oihane_push_function_url = https://<PROJECT_REF>.supabase.co/functions/v1/dispatch-push
-- oihane_service_role_key = la service_role key (solo en Vault, nunca en GitHub ni en Oihane)
-- oihane_push_cron_secret = el mismo valor que OIHANE_PUSH_CRON_SECRET en Edge Function secrets
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
select cron.unschedule(jobid) from cron.job where jobname = 'oihane-dispatch-push-every-minute';
select cron.schedule(
  'oihane-dispatch-push-every-minute',
  '* * * * *',
  $$ select net.http_post(
       url := (select decrypted_secret from vault.decrypted_secrets where name = 'oihane_push_function_url' limit 1),
       headers := jsonb_build_object(
         'Content-Type','application/json',
         'Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'oihane_service_role_key' limit 1),
         'x-oihane-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name = 'oihane_push_cron_secret' limit 1)
       ),
       body := '{}'::jsonb
     ); $$
);
