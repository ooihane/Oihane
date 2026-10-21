import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm';
import './config.js';

const c = window.OIHANE_OAUTH_CONFIG || {};
const msg = document.querySelector('#msg');
const login = document.querySelector('#login');
const signin = document.querySelector('#signin');
const permission = document.querySelector('#permission');
const id = new URLSearchParams(location.search).get('authorization_id');

if (!/^https:\/\//.test(c.url || '') || !c.publishableKey || !c.expectedClientId) {
  msg.textContent = 'Configuración incompleta. Contacta con el administrador.';
  throw Error('oauth_configuration_missing');
}
if (!id) {
  msg.textContent = 'Falta el identificador de autorización.';
  throw Error('missing_authorization_id');
}

const client = createClient(c.url, c.publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
});

async function refresh() {
  msg.textContent = '';
  const { data: { user }, error: userError } = await client.auth.getUser();
  signin.hidden = !!user;
  permission.hidden = !user;
  if (userError || !user) return;

  const { data, error } = await client.auth.oauth.getAuthorizationDetails(id);
  if (error || !data) {
    msg.textContent = 'No se pudo verificar esta solicitud.';
    permission.hidden = true;
    return;
  }

  const clientId = data.client?.id || data.client_id || data.client?.client_id || '';
  if (clientId !== c.expectedClientId) {
    msg.textContent = 'La aplicación solicitante no coincide con la Skill autorizada.';
    permission.hidden = true;
    return;
  }
  document.querySelector('#account').textContent = 'Cuenta: ' + (user.email || 'Oihane');
  document.querySelector('#requesting').textContent = 'Aplicación solicitante: ' + (data.client?.name || 'Mi asistente');
}

login.addEventListener('submit', async e => {
  e.preventDefault();
  msg.textContent = 'Iniciando sesión…';
  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;
  const { error } = await client.auth.signInWithPassword({ email, password });
  document.querySelector('#password').value = '';
  if (error) {
    msg.textContent = 'No se pudo iniciar sesión; comprueba tu correo y contraseña.';
    return;
  }
  await refresh();
});

async function finish(accept) {
  permission.hidden = true;
  msg.textContent = 'Procesando autorización…';
  const { data, error } = accept
    ? await client.auth.oauth.approveAuthorization(id)
    : await client.auth.oauth.denyAuthorization(id);
  if (error || !data?.redirect_url) {
    msg.textContent = 'Error al completar la autorización.';
    permission.hidden = false;
    return;
  }
  const u = new URL(data.redirect_url);
  if (u.protocol !== 'https:') {
    msg.textContent = 'URL de redirección no segura.';
    return;
  }
  location.assign(u.toString());
}

document.querySelector('#approve').addEventListener('click', () => finish(true));
document.querySelector('#deny').addEventListener('click', () => finish(false));
await refresh();
