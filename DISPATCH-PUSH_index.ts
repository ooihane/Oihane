import { sendPushNotification } from "npm:@mmmike/web-push@1.3.0/send";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") || "mailto:admin@example.com";
const CRON_SECRET = Deno.env.get("OIHANE_PUSH_CRON_SECRET")!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-oihane-cron-secret", "Access-Control-Allow-Methods": "POST, OPTIONS", "Content-Type": "application/json" };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors });
const localParts = (date: Date, zone: string) => {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const x: Record<string,string> = {}; for (const q of p) if (q.type !== 'literal') x[q.type] = q.value;
  return { date: `${x.year}-${x.month}-${x.day}`, time: `${x.hour}:${x.minute}` };
};
const dateMinusMinutes = (date: string, time: string, minutes: number) => {
  const d = new Date(`${date}T${time}:00Z`); d.setUTCMinutes(d.getUTCMinutes() - minutes);
  return { date: d.toISOString().slice(0,10), time: d.toISOString().slice(11,16) };
};
async function rest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) } });
  const text = await response.text(); if (!response.ok) throw new Error(`Supabase ${response.status}: ${text}`);
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}
async function sendToSubscription(sub: any, payload: any) {
  try {
    const delivered = await sendPushNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload,
      { subject: VAPID_SUBJECT, publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY },
      { ttl: 3600 },
    );
    if (!delivered) {
      // A false result is not proof that the subscription expired. Only remove it on HTTP 404 or 410.
      console.error('Web Push send returned false; subscription kept for diagnosis');
      return false;
    }
    return true;
  } catch (error: any) {
    const status = Number(error?.statusCode || error?.status || 0);
    if (status === 404 || status === 410) { await rest(`oihane_push_subscriptions?id=eq.${encodeURIComponent(sub.id)}`, { method: 'DELETE' }).catch(() => {}); }
    console.error('Web Push send failed', status, String(error?.message || error));
    return false;
  }
}
// Atomic idempotency claim: the primary key on oihane_push_sent allows only one
// scheduled worker to claim a reminder across cron retries and concurrent calls.
// Prior SELECT-before-send was racy and could send the same notification twice.
async function claimReminder(userId: string, key: string, fireDate: string): Promise<boolean> {
  const row={user_id:userId,reminder_key:key,fire_date:fireDate};
  const rows=await rest('oihane_push_sent?on_conflict=user_id,reminder_key,fire_date',{
    method:'POST',
    headers:{Prefer:'resolution=ignore-duplicates,return=representation'},
    body:JSON.stringify(row)
  });
  return Array.isArray(rows) && rows.length===1;
}
async function releaseFailedReminder(userId: string, key: string, fireDate: string) {
  const match=`user_id=eq.${encodeURIComponent(userId)}&reminder_key=eq.${encodeURIComponent(key)}&fire_date=eq.${encodeURIComponent(fireDate)}`;
  await rest(`oihane_push_sent?${match}`,{method:'DELETE'});
}
async function sendUser(userId: string, subscriptions: any[], key: string, fireDate: string, title: string, body: string) {
  if(!subscriptions.length)return 0;
  if(!await claimReminder(userId,key,fireDate))return 0;
  let sent=0;
  try {
    for(const sub of subscriptions) {
      if(await sendToSubscription(sub,{title,body,tag:`${key}-${fireDate}`,url:'./'}))sent++;
    }
  } finally {
    // A failed delivery is not permanently marked as sent. A successful
    // delivery stays claimed so further runs cannot resend this reminder.
    if(!sent)await releaseFailedReminder(userId,key,fireDate).catch(err=>console.error('Failed to release push claim',err));
  }
  return sent;
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST required' }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const cronMode = !!CRON_SECRET && req.headers.get('x-oihane-cron-secret') === CRON_SECRET;
    if (!cronMode) {
      const authHeader = req.headers.get('Authorization') || '';
      if (!authHeader.startsWith('Bearer ')) return json({ error: 'Authentication required' }, 401);
      const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false, autoRefreshToken: false } });
      const { data: { user }, error } = await userClient.auth.getUser();
      if (error || !user) return json({ error: 'Invalid user session' }, 401);
      if (body.test !== true) return json({ error: 'Only an authenticated test push is allowed from the app' }, 403);
      const subs = await rest(`oihane_push_subscriptions?select=id,user_id,endpoint,p256dh,auth,timezone&user_id=eq.${encodeURIComponent(user.id)}`);
      let sent = 0; for (const sub of subs || []) if (await sendToSubscription(sub, { title: 'Notificación de prueba', body: '', tag: 'oihane-push-test', url: './' })) sent++;
      return json({ ok: true, sent });
    }
    const [backups, subscriptions] = await Promise.all([
      rest('oihane_backups?select=user_id,data&limit=1000'),
      rest('oihane_push_subscriptions?select=id,user_id,endpoint,p256dh,auth,timezone&limit=5000')
    ]);
    const subsByUser = new Map<string, any[]>(); for (const s of subscriptions || []) { const list = subsByUser.get(s.user_id) || []; list.push(s); subsByUser.set(s.user_id, list); }
    let sent = 0, checked = 0;
    const now = new Date();
    for (const row of backups || []) {
      const userSubs = subsByUser.get(row.user_id) || []; if (!userSubs.length) continue;
      const envelope = row.data || {}; const store = envelope.data || {};
      const tasks = Array.isArray(store.oihane_tasks) ? store.oihane_tasks : [];
      const events = Array.isArray(store.oihane_events) ? store.oihane_events : [];
      const zones = [...new Set(userSubs.map(s => s.timezone || 'Europe/Madrid'))];
      for (const zone of zones) {
        const local = localParts(now, zone);
        const zoneSubs = userSubs.filter(s => (s.timezone || 'Europe/Madrid') === zone);
        const pushText=(label: string, lead: number): string=>{
          if(!lead)return `Es la hora de ${label}`;
          if(lead<60)return `${lead===1?'Queda':'Quedan'} ${lead} ${lead===1?'minuto':'minutos'} para ${label}`;
          const hours=Math.ceil(lead/60), approx=lead%60!==0?'aproximadamente ':'';
          return `${hours===1?'Queda':'Quedan'} ${approx}${hours} ${hours===1?'hora':'horas'} para ${label}`;
        };
        // One notification per selected lead per item. For tasks without an explicit hour, use 09:00 local.
        for (const task of tasks) {
          if (!task || !task.notify || task.done || !task.date) continue;
          const dueTime=String(task.time||'09:00').slice(0,5);
          const lead=Math.max(0,Number(task.notifyLead)||0);
          const due=dateMinusMinutes(String(task.date),dueTime,lead);
          if(due.date!==local.date||due.time!==local.time)continue;
          const key=`task-${String(task.id)}-${lead}`;
          checked++;
          sent+=await sendUser(row.user_id,zoneSubs,key,`${due.date}T${due.time}`,pushText(String(task.title||'tu tarea'),lead),'');
        }
        for (const ev of events) {
          if(!ev || !ev.date || !ev.time)continue;
          const at=String(ev.time).slice(0,5);
          const name=String(ev.title||'tu evento');
          if(ev.notify){
            const lead=Math.max(0,Number(ev.notifyLead)||0);
            const due=dateMinusMinutes(String(ev.date),at,lead);
            if(due.date===local.date&&due.time===local.time){
              checked++;
              sent+=await sendUser(row.user_id,zoneSubs,`event-${String(ev.id)}-remind-${lead}`,`${due.date}T${due.time}`,pushText(name,lead),'');
            }
          }
          const departure=Math.max(0,Number(ev.departureMinutes)||0);
          if(departure>0){
            const leave=dateMinusMinutes(String(ev.date),at,departure);
            if(leave.date===local.date&&leave.time===local.time){
              checked++;
              sent+=await sendUser(row.user_id,zoneSubs,`event-${String(ev.id)}-leave-${departure}`,`${leave.date}T${leave.time}`,`Es la hora de salir para ${name}`,'');
            }
          }
        }
      }
    }
    return json({ ok: true, checked, sent });
  } catch (error) { console.error('dispatch-push error', error); return json({ error: String((error as any)?.message || error) }, 500); }
});
