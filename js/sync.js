/* СахарОК — онлайн-сохранение через Supabase.
 * Работает через обычный REST (без внешних библиотек): вход по почте и паролю,
 * одна строка в таблице user_data на человека. Приложение по-прежнему работает
 * офлайн, а при появлении сети само сливает изменения с облаком. */
'use strict';

const Sync = (() => {
  const KEY = 'saharok.sync';
  let st = read(), status = 'off', error = '', timer = null, busy = false, again = false, started = false;
  const statusListeners = [], dataListeners = [];

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* не страшно */ } }
  const cfg = () => (typeof window !== 'undefined' && window.SAHAROK_CONFIG) || {};
  // принимаем и адрес проекта, и «API URL» со страницы Data API (с хвостом /rest/v1/)
  const url = () => String(st.url || cfg().supabaseUrl || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  const key = () => String(st.key || cfg().supabaseKey || '').trim();
  const fromConfig = () => !!(cfg().supabaseUrl && cfg().supabaseKey);
  const configured = () => /^https:\/\/.+/.test(url()) && key().length > 20;
  const signedIn = () => !!(st.refresh && st.uid);

  function set(s, err = '') { status = s; error = err; statusListeners.forEach(f => f(status, error)); }

  function human(msg) {
    const m = String(msg || '');
    if (/Invalid login credentials/i.test(m)) return 'Неверная почта или пароль';
    if (/already (been )?registered/i.test(m)) return 'Такая почта уже зарегистрирована — нажми «Войти»';
    if (/Email not confirmed/i.test(m)) return 'Почта не подтверждена — открой письмо от Supabase и нажми ссылку';
    if (/Password should be at least/i.test(m)) return 'Пароль должен быть не короче 6 символов';
    if (/Unable to validate email|invalid format/i.test(m)) return 'Проверь адрес почты';
    if (/Failed to fetch|NetworkError|Load failed|network/i.test(m)) return 'Нет связи с сервером';
    if (/Invalid API key|No API key/i.test(m)) return 'Неверный ключ проекта Supabase';
    if (/user_data|relation .* does not exist|schema cache/i.test(m)) return 'В базе нет таблицы user_data — выполни supabase/setup.sql';
    if (/refresh token/i.test(m)) return 'Сессия устарела — войди заново';
    return m || 'Неизвестная ошибка';
  }

  async function auth(path, body) {
    let r;
    try {
      r = await fetch(`${url()}/auth/v1/${path}`, {
        method: 'POST',
        headers: { apikey: key(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) { throw new Error(human(e.message)); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(human(j.error_description || j.msg || j.message || j.error || `ошибка ${r.status}`));
    return j;
  }

  function session(j) {
    st.access = j.access_token;
    st.refresh = j.refresh_token;
    st.exp = Date.now() + (j.expires_in || 3600) * 1000;
    if (j.user) { st.uid = j.user.id; st.email = j.user.email; }
    persist();
  }

  async function token() {
    if (st.access && Date.now() < st.exp - 60000) return st.access;
    try { session(await auth('token?grant_type=refresh_token', { refresh_token: st.refresh })); }
    catch (e) {
      if (/устарела|Неверн/.test(e.message)) { st = { url: st.url, key: st.key, email: st.email }; persist(); }
      throw e;
    }
    return st.access;
  }

  async function rest(method, path, body, headers = {}) {
    const t = await token();
    let r;
    try {
      r = await fetch(`${url()}/rest/v1/${path}`, {
        method,
        headers: Object.assign({ apikey: key(), Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }, headers),
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) { throw new Error(human(e.message)); }
    if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(human(j.message || `ошибка сервера ${r.status}`)); }
    const txt = await r.text();
    return txt ? JSON.parse(txt) : null;
  }

  async function syncNow() {
    if (!configured() || !signedIn()) { set('off'); return false; }
    if (busy) { again = true; return false; }
    if (navigator.onLine === false) { set('offline'); return false; }
    busy = true;
    set('syncing');
    try {
      const rows = await rest('GET', `user_data?select=data&user_id=eq.${st.uid}`);
      const local = Core.get();
      const before = JSON.stringify(local);
      let merged = rows && rows[0] && rows[0].data ? Core.merge(local, rows[0].data) : local;
      if (!merged.calToken) merged = Object.assign({}, merged, { calToken: Core.randomToken() });
      const changed = JSON.stringify(merged) !== before;
      if (changed) {
        Core.replaceAll(merged, { silent: true });
        dataListeners.forEach(f => f());
      }
      const doc = Core.get();
      await rest('POST', 'user_data?on_conflict=user_id',
        { user_id: st.uid, data: doc, cal_token: doc.calToken, updated_at: new Date().toISOString() },
        { Prefer: 'resolution=merge-duplicates,return=minimal' });
      st.lastSync = Date.now();
      persist();
      set('ok');
      return true;
    } catch (e) {
      set(signedIn() ? 'error' : 'off', e.message);
      return false;
    } finally {
      busy = false;
      if (again) { again = false; schedule(1000); }
    }
  }

  function schedule(delay = 3000) {
    if (!configured() || !signedIn()) return;
    clearTimeout(timer);
    timer = setTimeout(syncNow, delay);
  }

  async function signIn(email, password) {
    session(await auth('token?grant_type=password', { email, password }));
    return syncNow();
  }
  async function signUp(email, password) {
    const j = await auth('signup', { email, password });
    if (j.access_token) { session(j); await syncNow(); return 'ok'; }
    return 'confirm';
  }
  function signOut() { st = { url: st.url, key: st.key }; persist(); set('off'); }
  function setConfig(u, k) { st.url = String(u || '').trim(); st.key = String(k || '').trim(); persist(); }
  function calendarUrl() {
    const t = Core.get().calToken;
    return configured() && signedIn() && t ? `${url()}/functions/v1/calendar?token=${t}` : '';
  }

  // Автоматически: при старте, при возврате в приложение, при появлении сети и раз в 5 минут.
  function start() {
    if (started) return;
    started = true;
    window.addEventListener('online', () => syncNow());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) syncNow(); });
    setInterval(() => { if (!document.hidden) syncNow(); }, 5 * 60000);
    if (signedIn()) syncNow(); else set('off');
  }

  return {
    configured, signedIn, fromConfig, syncNow, schedule, signIn, signUp, signOut, setConfig, calendarUrl, start, url, key,
    onStatus: f => statusListeners.push(f),
    onData: f => dataListeners.push(f),
    get status() { return status; },
    get error() { return error; },
    get email() { return st.email; },
    get lastSync() { return st.lastSync; },
  };
})();
