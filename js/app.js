/* СахарОК — интерфейс: экраны, окна, напоминания. Данные и формулы — в core.js. */
'use strict';

(() => {
  const C = Core;
  const { fmt, fmtU, fmtS, parseNum, pad, plural, DAY, HOUR, MIN } = C;
  let D = C.load();
  const S = () => D.settings;
  const xg = () => S().xeGrams || 12;

  /* =========================================================
     Иконки (линейные, 24×24)
     ========================================================= */
  const ICONS = {
    home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 7.5h6M9 11h4"/>',
    drop: '<path d="M12 2.8c3.3 4 6.3 7.5 6.3 11a6.3 6.3 0 0 1-12.6 0c0-3.5 3-7 6.3-11z"/>',
    checklist: '<path d="m3.5 6 1.6 1.6L8.2 4.5M3.5 12.5l1.6 1.6 3.1-3.1M3.5 19l1.6 1.6 3.1-3.1M12 6h8.5M12 12.5h8.5M12 19h8.5"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    syringe: '<path d="m18 2 4 4M17 7l3-3M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5M9 11l4 4M5 19l-3 3M14 4l6 6"/>',
    moon: '<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z"/>',
    utensils: '<path d="M4.5 3v6.5a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2V3M7 3v18M19.5 15V3c-2.6 0-4 2.2-4 5v5c0 1.1.9 2 2 2zm0 0v6"/>',
    pen: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    cookie: '<path d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5 4 4 0 0 1-5-5 4 4 0 0 1-4.5-4.5z"/><path d="M8.5 8.5h.01M16 15.5h.01M12 12.5h.01M10.5 17h.01M7 13.5h.01"/>',
    lifebuoy: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="4"/><path d="m5.3 5.3 3.9 3.9M14.8 9.2l3.9-3.9M14.8 14.8l3.9 3.9M9.2 14.8l-3.9 3.9"/>',
    chart: '<path d="M3.5 3.5v17h17"/><path d="m7.5 14.5 4-4.5 3 3 5-6.5"/>',
    apple: '<path d="M12 7.5C11 6 9.6 5.5 8 5.5c-3 0-5 2.5-5 6 0 4.5 3 10 6 10 1.2 0 2-.6 3-.6s1.8.6 3 .6c3 0 6-5.5 6-10 0-3.5-2-6-5-6-1.6 0-3 .5-4 2z"/><path d="M12 7.5c0-2.2 1-4 3-4.5"/>',
    flame: '<path d="M12 21.5c3.9 0 6.8-2.7 6.8-6.5 0-3.3-2.2-5.7-3.9-7.8-.6 2-1.6 3-2.7 3.5.4-3.2-.8-6.3-3.2-7.9.3 3-1.4 5.3-3 7.4-1.3 1.7-1.8 3-1.8 4.8 0 3.8 3.9 6.5 7.8 6.5z"/>',
    pin: '<path d="M19.5 10c0 5.8-7.5 11.5-7.5 11.5S4.5 15.8 4.5 10a7.5 7.5 0 0 1 15 0z"/><circle cx="12" cy="10" r="2.8"/>',
    award: '<circle cx="12" cy="8.5" r="5.5"/><path d="M15.2 13 16.5 21.5 12 19l-4.5 2.5L8.8 13"/>',
    file: '<path d="M14 2.5H6.5A1.5 1.5 0 0 0 5 4v16a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 20V7.5z"/><path d="M14 2.5v5h5M9 13h6M9 17h6"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5M12 8h.01"/>',
    alert: '<path d="M10.3 3.9 2.4 17.6a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9.5v4M12 17h.01"/>',
    ok: '<circle cx="12" cy="12" r="9.5"/><path d="m8 12.5 2.7 2.7L16 9.5"/>',
    stop: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
    sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    cloud: '<path d="M17.5 19H8a6 6 0 1 1 5.7-7.9A4.5 4.5 0 1 1 17.5 19z"/>',
    calendar: '<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M8 2.5v4M16 2.5v4"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.2 2"/>',
    box: '<path d="M20.5 7.5 12 3 3.5 7.5v9L12 21l8.5-4.5z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5M12 12v9"/>',
    heart: '<path d="M19.6 13.4 12 21l-7.6-7.6A4.9 4.9 0 0 1 12 6.6a4.9 4.9 0 0 1 7.6 6.8z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.3-4.3"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9z"/>',
    shield: '<path d="M12 21.5s8-3.5 8-10V5l-8-2.5L4 5v6.5c0 6.5 8 10 8 10z"/>',
    target: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/>',
    refresh: '<path d="M20 11.5A8 8 0 0 0 6.2 6.2L4 8.5M4 4v4.5h4.5M4 12.5a8 8 0 0 0 13.8 5.3L20 15.5M20 20v-4.5h-4.5"/>',
    download: '<path d="M12 3.5v12M7 10.5l5 5 5-5M4.5 20h15"/>',
    upload: '<path d="M12 15.5v-12M7 8.5l5-5 5 5M4.5 20h15"/>',
    bell: '<path d="M6 9.5a6 6 0 0 1 12 0c0 5.5 2.5 7.5 2.5 7.5h-17S6 15 6 9.5zM10 20.5a2 2 0 0 0 4 0"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5a1.5 1.5 0 0 0-1.5-1.5H5A1.5 1.5 0 0 0 3.5 5v9A1.5 1.5 0 0 0 5 15.5h3.5"/>',
    sparkle: '<path d="M12 3.5 13.8 9 19.5 10.8 13.8 12.6 12 18.5 10.2 12.6 4.5 10.8 10.2 9z"/><path d="M19 3.5v3M17.5 5h3"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5"/>',
    calc: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5v3.5M8.5 18h.01M12 18h.01"/>',
  };
  const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* =========================================================
     Утилиты
     ========================================================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  const timeStr = t => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const dateLong = t => new Date(t).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateShort = t => new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  const dayMonth = t => new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const weekdayShort = t => new Date(t).toLocaleDateString('ru-RU', { weekday: 'short' });
  const todayKey = () => C.dayKey(Date.now());
  const numVal = v => v == null || v === '' ? '' : String(v).replace('.', ',');
  const dtLocal = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const typing = () => { const a = document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); };

  function dayTitle(t) {
    const k = C.dayKey(t);
    if (k === todayKey()) return `Сегодня, ${dayMonth(t)}`;
    if (k === C.dayKey(Date.now() + DAY)) return `Завтра, ${dayMonth(t)}`;
    if (k === C.dayKey(Date.now() - DAY)) return `Вчера, ${dayMonth(t)}`;
    return cap(dateLong(t));
  }
  function ago(t) {
    const m = Math.round((Date.now() - t) / MIN);
    if (m < -1) return `${dateShort(t)}, ${timeStr(t)}`;
    if (m < 1) return 'только что';
    if (m < 60) return `${m} мин назад`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ч ${m % 60 ? (m % 60) + ' мин ' : ''}назад`;
    return `${dateShort(t)}, ${timeStr(t)}`;
  }
  function save() { if (!C.save()) toast('Не получилось сохранить: память браузера переполнена'); }
  const touch = () => C.touchSettings();

  const ZONE_VAR = { vlow: '--z-vlow', low: '--z-low', ok: '--z-ok', high: '--z-high', vhigh: '--z-vhigh' };
  const gv = v => `<span class="gv z-${C.zone(v)}">${fmt(v)}</span>`;
  const NOTE_IC = { info: 'info', warn: 'alert', danger: 'stop', good: 'ok' };
  const note = (lvl, title, text = '', extra = '') => `<div class="note ${lvl}">${ic(NOTE_IC[lvl] || 'info')}<div class="grow">${title ? `<b>${title}</b>` : ''}${text ? `<p>${text}</p>` : ''}${extra}</div></div>`;
  const acc = k => `<details class="acc"><summary>${k.title}</summary><div class="acc-body">${k.html}</div></details>`;
  const fab = (act, label) => `<button class="fab" data-act="${act}">${ic('plus')}${label}</button>`;
  const empty = (icon, text, btn = '') => `<div class="empty">${ic(icon)}<div>${text}</div>${btn}</div>`;
  const field = (lbl, inner, hint) => `<label class="field"><span class="lbl">${lbl}</span>${inner}${hint ? `<div class="hint">${hint}</div>` : ''}</label>`;
  const numInput = (id, val, unit, ph = '', big = false) => `<div class="input-unit"><input class="input ${big ? 'big' : ''}" id="${id}" inputmode="decimal" value="${val}" placeholder="${ph}" autocomplete="off"><em>${unit}</em></div>`;
  const sNum = (lbl, path, val, unit, opts = {}) => field(lbl, `<div class="input-unit"><input class="input" inputmode="decimal" data-s="${path}" data-type="${opts.int ? 'int' : 'num'}" ${opts.min != null ? `data-min="${opts.min}"` : ''} ${opts.max != null ? `data-max="${opts.max}"` : ''} value="${numVal(val)}" placeholder="${opts.ph || ''}" autocomplete="off">${unit ? `<em>${unit}</em>` : ''}</div>`, opts.hint);
  const seg = (items, cur, act, cls = '') => `<div class="seg ${cls}">${items.map(([v, l]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-act="${act}" data-v="${v}">${l}</button>`).join('')}</div>`;

  function tirBar(st, legend = false) {
    const s = S();
    const parts = [
      ['vlow', st.vlow, 'очень низко (<3)'],
      ['low', st.low, `низко (<${fmt(s.rangeLow)})`],
      ['ok', st.ok, `в цели (${fmt(s.rangeLow)}–${fmt(s.rangeHigh, 0)})`],
      ['high', st.high, 'высоко (до 13,9)'],
      ['vhigh', st.vhigh, 'очень высоко (>13,9)'],
    ];
    const label = parts.map(p => `${p[2]}: ${Math.round(p[1])}%`).join(', ');
    return `<div class="tir" role="img" aria-label="${esc(label)}">${parts.filter(p => p[1] > 0).map(p => `<i class="${p[0]}" style="flex:${p[1]}"></i>`).join('')}</div>` +
      (legend ? `<div class="legend">${parts.map(p => `<span><i style="background:var(${ZONE_VAR[p[0]]})"></i>${p[2]}: <b>${Math.round(p[1])}%</b></span>`).join('')}</div>` : '');
  }

  /* ---------- тосты, уведомления, файлы ---------- */
  function toast(msg, opts = {}) {
    const el = document.createElement('div');
    el.className = 'toast' + (opts.undo ? '' : ' plain');
    el.innerHTML = `<span>${esc(msg)}</span>${opts.undo ? '<button type="button">Отменить</button>' : ''}`;
    if (opts.undo) el.querySelector('button').addEventListener('click', () => { opts.undo(); el.remove(); });
    $('#toastRoot').appendChild(el);
    setTimeout(() => el.remove(), opts.ms || (opts.undo ? 6000 : 2600));
  }

  async function notify(title, body) {
    try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) { /* без вибрации */ }
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
      if (reg) reg.showNotification(title, { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: title });
      else new Notification(title, { body, icon: 'icons/icon-192.png' });
    } catch (e) { console.warn(e); }
  }

  async function downloadFile(name, text, mime) {
    const blob = new Blob([text], { type: mime });
    const file = typeof File === 'function' ? new File([blob], name, { type: mime }) : null;
    if (/Android|iPhone|iPad/i.test(navigator.userAgent) && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: name }); return true; }
      catch (e) { if (e.name === 'AbortError') return false; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return true;
  }

  /* ---------- нижние окна ---------- */
  let sheetSticky = false, sheetOnClose = null;
  function openSheet(title, body, opts = {}) {
    $('#modalRoot').innerHTML = `<div class="overlay" data-act="overlay"><div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="grabber"></div>
      <div class="sheet-head"><h2>${esc(title)}</h2><button class="close" data-act="closeSheet" aria-label="Закрыть">${ic('x')}</button></div>
      <div id="sheetBody">${body}</div></div></div>`;
    sheetSticky = !!opts.sticky;
    sheetOnClose = opts.onClose || null;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    document.body.style.overflow = 'hidden';
    if (opts.focus) setTimeout(() => { const f = $(opts.focus); f && f.focus(); }, 90);
  }
  function closeSheet() {
    $('#modalRoot').innerHTML = '';
    document.body.style.overflow = '';
    const f = sheetOnClose; sheetOnClose = null;
    f && f();
  }
  const sheetOpen = () => !!$('#modalRoot .overlay');
  const closeSheetIfOpen = () => { if (sheetOpen()) closeSheet(); };
  const setSheetBody = html => { const b = $('#sheetBody'); if (b) b.innerHTML = html; };
  const setSheetTitle = t => { const h = $('.sheet-head h2'); if (h) h.textContent = t; };

  /* ---------- таймер: укол до еды, гипо, тяга к сладкому ---------- */
  const TIMER_KEY = 'saharok.timer';
  let timer = null;
  try { timer = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null'); } catch (e) { timer = null; }
  if (timer && timer.end < Date.now() - 10 * MIN) timer = null;

  function startTimer(minutes, label, kind) {
    timer = { end: Date.now() + minutes * MIN, label, kind };
    try { localStorage.setItem(TIMER_KEY, JSON.stringify(timer)); } catch (e) { /* не страшно */ }
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    tick();
  }
  function stopTimer() {
    timer = null;
    try { localStorage.removeItem(TIMER_KEY); } catch (e) { /* не страшно */ }
    tick();
  }
  const mmss = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };

  function tick() {
    const pill = $('#timerPill');
    if (!timer) { pill.hidden = true; return; }
    const left = timer.end - Date.now();
    pill.hidden = false;
    pill.innerHTML = `${ic('timer', 'sm')}${mmss(left)}`;
    $$('[data-timer]').forEach(el => { el.textContent = mmss(left); });
    if (left <= 0) {
      const t = timer;
      stopTimer();
      notify(t.label, t.kind === 'hypo' ? 'Прошло 15 минут — перемерь сахар' : t.kind === 'prebolus' ? 'Можно начинать есть' : 'Как ты? Тяга прошла?');
      toast(t.label, { ms: 5000 });
      if (t.kind === 'hypo') { hypo = hypo || { rounds: 1, reasons: new Set() }; hypo.step = 'recheck'; openHypo(); }
      if (t.kind === 'craving') { crave.step = 'after'; openCraving(); }
    }
  }

  /* =========================================================
     Роутинг
     ========================================================= */
  const VIEWS = {
    home:         { title: 'Главная', render: vHome, after: () => drawDay('todayChart', C.startOfDay(Date.now())) },
    diary:        { title: 'Дневник', render: vDiary, after: afterDiary },
    calc:         { title: 'Доза', render: vCalc, after: afterCalc },
    plans:        { title: 'Планы', render: vPlans },
    more:         { title: 'Ещё', render: vMore },
    analysis:     { title: 'Анализ', render: vAnalysis, after: afterAnalysis, parent: 'more' },
    basal:        { title: 'Ночной инсулин', render: vBasal, parent: 'more' },
    nutrition:    { title: 'Питание', render: vNutrition, parent: 'more' },
    foods:        { title: 'Продукты', render: vFoods, after: renderFoodList, parent: 'more' },
    sites:        { title: 'Места уколов', render: vSites, parent: 'more' },
    achievements: { title: 'Достижения', render: vAchievements, parent: 'more' },
    report:       { title: 'Отчёт для врача', render: vReport, parent: 'more' },
    knowledge:    { title: 'Справочник', render: vKnowledge, parent: 'more' },
    settings:     { title: 'Настройки', render: vSettings, parent: 'more' },
    sync:         { title: 'Онлайн-сохранение', render: vSync, parent: 'more' },
  };
  let route = 'home';

  function render() {
    const h = (location.hash || '#home').slice(1);
    route = VIEWS[h] ? h : 'home';
    const v = VIEWS[route];
    $('#title').textContent = v.title;
    $('#backBtn').hidden = !v.parent;
    $$('.tabbar a').forEach(a => a.classList.toggle('active', a.dataset.tab === (v.parent || route)));
    $('#view').innerHTML = v.render();
    v.after && v.after();
  }
  const go = r => { if (location.hash === '#' + r) render(); else location.hash = r; window.scrollTo(0, 0); };

  function renderChrome() {
    const tabs = [['home', 'home', 'Главная'], ['diary', 'book', 'Дневник'], ['calc', 'drop', 'Доза'], ['plans', 'checklist', 'Планы'], ['more', 'grid', 'Ещё']];
    $('#tabbar').innerHTML = tabs.map(([id, icon, l]) => `<a href="#${id}" data-tab="${id}" class="${id === 'calc' ? 'tab-main' : ''}">${ic(icon)}<span>${l}</span></a>`).join('');
    $('#backBtn').innerHTML = ic('chevL', 'lg');
    $('#syncBtn').innerHTML = ic('cloud');
    $('.hypo-btn').innerHTML = `${ic('lifebuoy', 'sm')}Гипо`;
  }
  function updateSyncDot() {
    const b = $('#syncBtn');
    b.hidden = !Sync.configured();
    b.className = 'icon-btn sync-dot ' + (Sync.signedIn() ? Sync.status : 'off');
  }

  /* =========================================================
     Главная
     ========================================================= */
  const lastReading = () => { for (let i = D.entries.length - 1; i >= 0; i--) if (D.entries[i].glucose != null && D.entries[i].t <= Date.now() + MIN) return D.entries[i]; return null; };

  function vHome() {
    const s = S(), now = Date.now();
    const last = lastReading();
    const iob = C.iobAt(now);
    const hr = new Date().getHours();
    const greet = hr < 5 ? 'Доброй ночи' : hr < 12 ? 'Доброе утро' : hr < 18 ? 'Добрый день' : 'Добрый вечер';

    let h = `<div class="greet"><h2 class="mb0">${greet}${s.name ? ', ' + esc(s.name) : ''}</h2><div class="d">${cap(dateLong(now))}</div></div>`;
    h += messageCard();

    const z = last ? C.zone(last.glucose) : null;
    h += `<div class="card">
      <div class="hero-top"><div class="big-num" ${last ? '' : 'style="color:var(--surface-3)"'}>${last ? fmt(last.glucose) : '—'}<small>ммоль/л</small></div>${last ? `<span class="zone z-${z}">${C.ZONE_LABEL[z]}</span>` : ''}</div>
      <div class="meta-line">${last ? `<span>${ic('clock', 'sm')}${ago(last.t)}</span>${trendText(last)}` : '<span>Замеров пока нет — добавь первый</span>'}
        ${iob.units >= 0.1 ? `<span>${ic('drop', 'sm')}активный инсулин ${fmt(iob.units)} ЕД до ${timeStr(iob.endsAt)}</span>` : ''}</div>
      <div class="inline-add mt"><div class="input-unit"><input class="input" id="quickG" inputmode="decimal" placeholder="Новый замер" autocomplete="off" enterkeyhint="done"><em>ммоль/л</em></div><button class="btn primary" data-act="quickG">Записать</button></div>
    </div>`;

    h += `<div class="actions">
      <button class="action" data-act="go" data-to="calc"><span class="ic-wrap">${ic('utensils')}</span>Еда и доза</button>
      <button class="action" data-act="add" data-kind="bolus"><span class="ic-wrap">${ic('syringe')}</span>Укол</button>
      <button class="action" data-act="add" data-kind="note"><span class="ic-wrap">${ic('pen')}</span>Заметка</button>
      <button class="action rose" data-act="craving"><span class="ic-wrap">${ic('cookie')}</span>Хочу сладкое</button>
    </div>`;

    h += homeAlerts();
    h += basalCard();
    h += todayCard();
    h += nutritionCard();
    h += plansTodayCard();
    h += routineCard();
    h += cycleCard();
    h += moodCard();
    return h;
  }

  function trendText(last) {
    const prev = [...D.entries].reverse().find(e => e.glucose != null && e.t < last.t && last.t - e.t <= 3 * HOUR && last.t - e.t >= 10 * MIN);
    if (!prev) return '';
    const d = last.glucose - prev.glucose, mins = Math.round((last.t - prev.t) / MIN);
    const rate = d / mins * 60;
    const arrow = rate > 2 ? '↑' : rate > 0.8 ? '↗' : rate < -2 ? '↓' : rate < -0.8 ? '↘' : '→';
    return `<span>${arrow} ${fmtS(d)} за ${mins < 60 ? mins + ' мин' : fmt(mins / 60) + ' ч'}</span>`;
  }

  function loggingStreak() {
    let n = 0;
    for (let t = C.startOfDay(Date.now()) - DAY; n <= 365; t -= DAY) {
      if (C.readings(t, t + DAY).length >= 2) n++; else break;
    }
    return n;
  }

  function messageCard() {
    const s = S(), notes = s.loveNotes.filter(Boolean), k = todayKey();
    const seed = [...k].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    if (notes.length && seed % 2 === 0) {
      return `<div class="message"><span class="from">${s.loveFrom ? 'От ' + esc(s.loveFrom) : 'Записка для тебя'}</span>${esc(notes[(seed >> 1) % notes.length])}</div>`;
    }
    const y0 = C.startOfDay(Date.now() - DAY), y = C.stats(y0, y0 + DAY);
    const ctx = [];
    if (y.n >= 4 && y.ok >= 70) ctx.push(`Вчера ${Math.round(y.ok)}% замеров были в цели — это ровно тот уровень, который советуют врачи.`);
    if (y.n && y.hypos) ctx.push('Вчера была гипо, и ты с ней справилась. Сегодня можно быть к себе помягче.');
    if (y.n >= 4 && y.ok < 50) ctx.push('Вчера сахар вёл себя как хотел. Бывает с каждым. Сегодня — новые цифры.');
    const streak = loggingStreak();
    if (streak >= 3) ctx.push(`${streak} ${plural(streak, 'день', 'дня', 'дней')} подряд с дневником. Это и есть забота о себе — без громких слов.`);
    if (new Date().getHours() >= 14 && !C.readings(C.startOfDay(Date.now()), Date.now() + 1).length) ctx.push('Сегодня пока ни одного замера. Ничего страшного — начни с одного.');
    if (ctx.length && seed % 3 !== 1) return `<div class="message"><span class="from">По твоим записям</span>${esc(ctx[seed % ctx.length])}</div>`;
    return `<div class="message"><span class="from">На сегодня</span>${esc(SUPPORT_PHRASES[seed % SUPPORT_PHRASES.length])}</div>`;
  }

  function homeAlerts() {
    const s = S(), now = Date.now();
    let h = '';
    if (!s.onboarded) h += note('info', 'Давай настроим СахарОК', 'Пара минут: твои данные, хлебные единицы, коэффициенты и инсулины.', `<button class="btn primary sm" data-act="wizard">Начать настройку</button>`);
    else if (!C.isConfigured()) h += note('info', 'Калькулятор дозы ещё не настроен', 'Не хватает коэффициентов от эндокринолога.', `<button class="btn tonal sm" data-act="wizardCoef">Заполнить</button>`);
    if (s.modules.supplies) {
      const low = D.supplies.filter(x => { const d = C.supplyDays(x); return d != null && d < x.warnDays; });
      if (low.length) h += note('warn', 'Заканчиваются запасы', low.map(x => `${esc(x.name)} — на ${Math.floor(C.supplyDays(x))} дн.`).join('<br>'), `<button class="btn tonal sm" data-act="plansTab" data-tab="supplies">Открыть запасы</button>`);
    }
    if (Sync.signedIn() && Sync.status === 'error') h += note('warn', 'Не получилось сохранить в облако', esc(Sync.error), `<button class="btn tonal sm" data-act="go" data-to="sync">Подробнее</button>`);
    else if (!Sync.signedIn() && D.entries.length > 30 && (!s.lastBackup || now - s.lastBackup > 14 * DAY)) {
      h += note('info', 'Данные пока только на этом телефоне', 'Включи онлайн-сохранение или сохрани копию файлом.', `<div class="btn-row mt-s"><button class="btn tonal sm" data-act="go" data-to="sync">Онлайн-сохранение</button><button class="btn sm" data-act="exportJson">Копия</button></div>`);
    }
    return h;
  }

  function basalCard() {
    const s = S();
    if (!s.basalDose && !s.basalName) {
      return `<div class="card"><div class="card-head"><h3>Ночной инсулин</h3></div><p class="small text-2">Укажи название и обычную дозу — я буду напоминать и подсказывать дозу на каждую ночь по твоим сахарам.</p><button class="btn tonal sm" data-act="wizardStep" data-step="4">Указать</button></div>`;
    }
    const taken = C.basalTonight();
    if (taken.length) {
      const e = taken[taken.length - 1];
      return `<div class="card"><div class="card-head"><h3>Ночной инсулин</h3><button class="link" data-act="editEntry" data-id="${e.id}">Изменить</button></div>
        <div class="row"><span class="check on">${ic('check')}</span><div class="grow"><b>Уколот в ${timeStr(e.t)} · ${fmtU(e.basal)} ЕД</b><div class="small muted">Следующий — завтра в ${esc(s.basalTime)}</div></div></div></div>`;
    }
    const plan = C.basalPlan();
    const w = C.nightWindow();
    const late = Date.now() > w.due + 30 * MIN;
    const site = suggestSite('basal');
    return `<div class="card"><div class="card-head"><h3>Ночной инсулин</h3><span class="small ${late ? '' : 'muted'}" ${late ? 'style="color:var(--danger);font-weight:600"' : ''}>${late ? 'пора уколоть' : 'сегодня в ' + esc(s.basalTime)}</span></div>
      <div class="row between"><div><div class="big-num" style="font-size:36px">${plan.dose ? fmtU(plan.dose) : '—'}<small>ЕД</small></div>
        <div class="small muted mt-s">${esc(s.basalName || 'длинный инсулин')}${plan.change ? ` · обычно ${fmtU(plan.base)} ЕД` : ''}${site ? ` · ${site.label.toLowerCase()}` : ''}</div></div>
        <button class="btn primary" data-act="${plan.dose ? 'basalDone' : 'add'}" data-kind="basal" data-dose="${plan.dose || ''}">${ic('check', 'sm')}Уколола</button></div>
      ${plan.reasons.length ? `<div class="mt">${note(plan.change ? 'warn' : 'info', plan.change ? `Сегодня советую ${fmtU(plan.dose)} ЕД вместо ${fmtU(plan.base)}` : '', plan.reasons.map(esc).join('. ') + '.' + (plan.change ? ' Если врач советовал иначе — коли как обычно.' : ''))}</div>` : ''}
      <button class="btn ghost sm" data-act="add" data-kind="basal" style="margin:6px 0 -6px -8px">Другая доза или время</button></div>`;
  }

  function todayCard() {
    const d0 = C.startOfDay(Date.now()), st = C.stats(d0, Date.now() + MIN);
    return `<div class="card"><div class="card-head"><h3>Сахар сегодня</h3><button class="link" data-act="go" data-to="diary">Дневник ${ic('chevR', 'sm')}</button></div>
      ${st.n ? `<div class="stats" style="margin-bottom:12px"><div class="stat"><b>${fmt(st.mean)}</b><span>средний</span></div><div class="stat"><b>${Math.round(st.ok)}%</b><span>в цели</span></div><div class="stat"><b>${st.n}</b><span>${plural(st.n, 'замер', 'замера', 'замеров')}</span></div></div>${tirBar(st)}` : ''}
      <div class="chart-wrap mt"><canvas id="todayChart" aria-label="График сахара за сегодня"></canvas></div>${chartLegend()}</div>`;
  }

  const chartLegend = () => `<div class="legend"><span><i style="background:var(--chart-line)"></i>сахар</span><span><i style="background:var(--chart-band);outline:1px solid var(--z-ok)"></i>цель</span><span><b style="color:var(--info);font-size:10px">▲</b>инсулин</span><span><i style="background:var(--z-high);border-radius:50%"></i>еда</span></div>`;

  function meter(label, cur, goal, unit, d = 0) {
    const pct = goal ? cur / goal * 100 : 0;
    return `<div class="meter"><div class="top"><span>${label}</span><span><b>${fmt(cur, d)}</b> <span class="muted">из ${fmt(goal, d)} ${unit}</span></span></div><div class="bar ${pct > 110 ? 'over' : ''}"><i style="width:${Math.min(100, pct)}%"></i></div></div>`;
  }

  function nutritionCard() {
    if (!S().modules.nutrition) return '';
    const norm = C.nutritionNorm();
    if (!norm) return `<div class="card"><div class="card-head"><h3>Питание</h3></div><p class="small text-2">Посчитаю норму калорий, белков, жиров и углеводов по твоему росту, весу и активности.</p><button class="btn tonal sm" data-act="go" data-to="nutrition">Посчитать норму</button></div>`;
    const d0 = C.startOfDay(Date.now()), day = C.nutritionDay(d0, Date.now() + MIN);
    return `<div class="card"><div class="card-head"><h3>Питание сегодня</h3><button class="link" data-act="go" data-to="nutrition">Подробнее ${ic('chevR', 'sm')}</button></div>
      ${meter('Калории', day.kcal, norm.kcal, 'ккал')}
      ${norm.xe ? meter('Углеводы', day.carbs / xg(), norm.xe, 'ХЕ', 1) : meter('Углеводы', day.carbs, norm.carbs, 'г')}
      <div class="totals"><span>Белки <b>${Math.round(day.protein)}</b> / ${norm.protein} г</span><span>Жиры <b>${Math.round(day.fat)}</b> / ${norm.fat} г</span></div>
      ${day.unknownKcal ? `<div class="hint">${day.unknownKcal} ${plural(day.unknownKcal, 'приём', 'приёма', 'приёмов')} без калорий — записывай еду через «Доза», там калории считаются сами.</div>` : ''}</div>`;
  }

  function plansTodayCard() {
    const k = todayKey();
    const list = D.plans.filter(p => !p.done && p.date && p.date <= k).sort(planSort);
    return `<div class="card"><div class="card-head"><h3>Дела на сегодня</h3><button class="link" data-act="go" data-to="plans">Все ${ic('chevR', 'sm')}</button></div>
      ${list.length ? `<div class="list">${list.slice(0, 6).map(planRow).join('')}</div>${list.length > 6 ? `<div class="small muted mt-s">и ещё ${list.length - 6}</div>` : ''}` : '<p class="small muted mb0">На сегодня дел нет.</p>'}
      <button class="btn tonal sm mt" data-act="planNew">${ic('plus', 'sm')}Дело</button></div>`;
  }

  let routineExpanded = false;
  function routineCard() {
    const k = todayKey();
    const items = C.routineFor(k);
    if (!items.length) return '';
    const done = new Set(D.routineDone[k] || []);
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const pending = items.filter(i => !done.has(i.id));
    const shown = routineExpanded ? items : pending.filter(i => C.timeToMin(i.time) >= nowMin - 60).slice(0, 3);
    const streak = C.routineStats().cur;
    return `<div class="card"><div class="card-head"><h3>Режим дня</h3><span class="small muted">${done.size} из ${items.length}${streak > 1 ? ` · серия ${streak} ${plural(streak, 'день', 'дня', 'дней')}` : ''}</span></div>
      ${shown.length ? `<div class="list">${shown.map(i => routineRow(i, done.has(i.id))).join('')}</div>` : `<p class="small muted mb0">${pending.length ? 'Ближайших пунктов нет.' : 'Всё на сегодня сделано.'}</p>`}
      <button class="btn ghost sm" data-act="routineExpand" style="margin:6px 0 -6px -8px">${routineExpanded ? 'Свернуть' : 'Весь режим'}</button></div>`;
  }
  const routineRow = (i, isDone) => `<div class="row-item tap ${isDone ? 'done' : ''}" data-act="routineToggle" data-id="${i.id}">
    <span class="check ${isDone ? 'on' : ''}">${ic('check')}</span><div class="grow"><div class="t">${esc(i.title)}</div><div class="s">${esc(i.time)}</div></div></div>`;

  function cycleCard() {
    if (!S().modules.cycle) return '';
    const ci = C.cycleInfo();
    if (!ci) return `<div class="card"><div class="card-head"><h3>Цикл</h3></div><p class="small text-2">Отмечай первый день месячных — я подскажу, когда сахар может вести себя иначе, и сама включу нужную поправку в расчёте.</p><button class="btn tonal sm" data-act="cycleStart">Начались сегодня</button></div>`;
    return `<div class="card"><div class="card-head"><h3>Цикл · день ${ci.day}</h3><span class="small muted">${ci.untilNext > 0 ? `до месячных ~${ci.untilNext} ${plural(ci.untilNext, 'день', 'дня', 'дней')}` : 'ожидаются'}</span></div>
      <p class="small text-2 mb0">${ci.hint}</p>${ci.day > 3 ? '<button class="btn tonal sm mt" data-act="cycleStart">Начались сегодня</button>' : ''}</div>`;
  }

  const MOODS = ['Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично'];
  function moodCard() {
    const cur = D.moods[todayKey()];
    return `<div class="card"><div class="card-head"><h3>Как ты сегодня?</h3></div><div class="mood">${MOODS.map((m, i) => `<button class="${cur === i + 1 ? 'on' : ''}" data-act="mood" data-v="${i + 1}">${m}</button>`).join('')}</div>
      ${cur && cur <= 2 ? '<p class="small text-2 mt mb0">Тяжёлые дни бывают. Не нужно справляться идеально — достаточно просто продолжать.</p>' : ''}</div>`;
  }

  /* =========================================================
     Дневник
     ========================================================= */
  let diaryDay = C.startOfDay(Date.now());
  const ACTIVITY = [['walk', 'Прогулка'], ['cardio', 'Бег, велосипед'], ['dance', 'Танцы'], ['strength', 'Силовая'], ['other', 'Другое']];

  function vDiary() {
    const today0 = C.startOfDay(Date.now());
    const days = [];
    for (let i = 20; i >= 0; i--) days.push(C.startOfDay(today0 - i * DAY + 2 * HOUR));
    let h = `<div class="date-strip" id="dateStrip">${days.map(t => {
      const st = C.stats(t, t + DAY);
      const dot = st.n ? `background:var(${ZONE_VAR[C.zone(st.mean)]})` : '';
      return `<button class="${t === diaryDay ? 'on' : ''}" data-act="diaryDay" data-t="${t}"><span class="w">${weekdayShort(t)}</span><span class="n">${new Date(t).getDate()}</span><span class="dt" style="${dot}"></span></button>`;
    }).join('')}</div>`;

    const from = diaryDay, to = diaryDay + DAY;
    const es = D.entries.filter(e => e.t >= from && e.t < to);
    const st = C.stats(from, to);
    const sum = C.dailySummary(from, to)[0];
    h += `<div class="row between" style="margin:0 4px 10px"><h3 class="mb0">${dayTitle(diaryDay)}</h3><label class="btn ghost sm" style="position:relative;overflow:hidden">${ic('calendar', 'sm')}Дата<input type="date" data-onchange="diaryPick" value="${C.dayKey(diaryDay)}" max="${todayKey()}" style="position:absolute;inset:0;opacity:0" aria-label="Выбрать дату"></label></div>`;
    if (es.length) {
      h += `<div class="card"><div class="stats">
        <div class="stat"><b>${st.n ? fmt(st.mean) : '—'}</b><span>средний сахар</span></div>
        <div class="stat"><b>${st.n ? Math.round(st.ok) + '%' : '—'}</b><span>в цели</span></div>
        <div class="stat"><b>${sum ? fmt(sum.carbs / xg()) : 0}</b><span>ХЕ за день</span></div>
        <div class="stat"><b>${sum && sum.kcal ? Math.round(sum.kcal) : '—'}</b><span>ккал</span></div>
        <div class="stat"><b>${sum ? fmtU(sum.bolus) : 0}</b><span>короткий, ЕД</span></div>
        <div class="stat"><b>${sum && sum.basal ? fmtU(sum.basal) : '—'}</b><span>ночной, ЕД</span></div>
      </div>${st.n ? `<div class="mt">${tirBar(st)}</div>` : ''}
      <div class="chart-wrap mt"><canvas id="dayChart" aria-label="График сахара за день"></canvas></div>${chartLegend()}</div>`;
      h += `<div class="card pad0">${es.map(entryRow).join('')}</div>`;
    } else {
      h += `<div class="card">${empty('book', diaryDay === today0 ? 'Сегодня записей ещё нет.' : 'В этот день записей нет.', '<button class="btn tonal sm mt" data-act="add" data-kind="glucose">Добавить запись</button>')}</div>`;
    }
    const mood = D.moods[C.dayKey(diaryDay)];
    if (mood) h += `<p class="small muted center">Самочувствие: ${MOODS[mood - 1].toLowerCase()}</p>`;
    h += fab('add', 'Запись');
    return h;
  }

  function afterDiary() {
    const strip = $('#dateStrip'), on = $('#dateStrip .on');
    if (strip && on) strip.scrollLeft = on.offsetLeft - strip.clientWidth + on.offsetWidth + 16;
    drawDay('dayChart', diaryDay);
  }

  function entryRow(e) {
    const parts = [];
    if (e.glucose != null) parts.push(gv(e.glucose));
    if (e.carbs > 0) parts.push(`<span><span class="k">еда</span>${fmt(e.carbs / xg())} ХЕ</span>`);
    if (e.bolus > 0) parts.push(`<span><span class="k">короткий</span>${fmtU(e.bolus)} ЕД</span>`);
    if (e.basal > 0) parts.push(`<span><span class="k">ночной</span>${fmtU(e.basal)} ЕД</span>`);
    if (e.ketones != null) parts.push(`<span><span class="k">кетоны</span>${fmt(e.ketones)}</span>`);
    const act = e.activity ? `${(ACTIVITY.find(a => a[0] === e.activity.kind) || ACTIVITY[4])[1]}, ${e.activity.min} мин` : '';
    const line2 = [e.food, e.kcal ? `${Math.round(e.kcal)} ккал` : '', act, e.note].filter(Boolean).map(esc).join(' · ');
    const tags = (e.tags || []).filter(t => !(t === 'sport' && e.activity)).map(t => (C.TAGS.find(x => x.id === t) || {}).label).filter(Boolean);
    return `<div class="entry" data-act="editEntry" data-id="${e.id}"><div class="time">${timeStr(e.t)}</div><div class="main">
      <div class="line1">${parts.join('') || '<span class="muted">заметка</span>'}</div>
      ${line2 ? `<div class="line2">${line2}</div>` : ''}${tags.length ? `<div class="tagline">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}</div></div>`;
  }

  /* ---------- окно записи ---------- */
  const ENTRY_TYPES = [['glucose', 'Сахар'], ['meal', 'Еда'], ['bolus', 'Укол'], ['note', 'Заметка']];
  const ENTRY_TITLES = { glucose: 'Замер сахара', meal: 'Еда', bolus: 'Укол короткого инсулина', basal: 'Ночной инсулин', note: 'Заметка' };
  const ENTRY_FOCUS = { glucose: '#eG', meal: '#eC', bolus: '#eB', basal: '#eBa', note: '#eNote' };
  let entryCtx = null;

  function entryTypeOf(e) {
    if (e.basal > 0 && !(e.bolus > 0) && !(e.carbs > 0)) return 'basal';
    if (e.carbs > 0 || e.kcal > 0) return 'meal';
    if (e.bolus > 0) return 'bolus';
    if (e.glucose != null && !e.activity && e.ketones == null) return 'glucose';
    return 'note';
  }

  function openEntry(type = 'glucose', id = null, preset = {}) {
    const e = id ? D.entries.find(x => x.id === id) : null;
    if (e) type = entryTypeOf(e);
    const v = Object.assign({ t: Date.now() }, e || {}, preset);
    if (type === 'basal' && !e && v.basal == null) { const plan = C.basalPlan(); if (plan.dose) v.basal = plan.dose; }
    entryCtx = { id, type, unit: S().carbMode === 'xe' ? 'xe' : 'g', tags: new Set(v.tags || []), v };
    openSheet(e ? 'Запись' : ENTRY_TITLES[type], entryBody(), { sticky: true, focus: e ? null : ENTRY_FOCUS[type] });
  }

  function entryBody() {
    const { type, v, id } = entryCtx, s = S();
    const carbsVal = v.carbs > 0 ? numVal(Math.round((entryCtx.unit === 'xe' ? v.carbs / xg() : v.carbs) * 10) / 10) : '';
    const siteSel = () => {
      const next = id ? null : suggestSite(type === 'basal' ? 'basal' : 'bolus');
      const cur = v.site || (next ? next.id : '');
      return field('Место укола', `<select class="input" id="eSite"><option value="">не отмечать</option>${C.SITES.map(x => `<option value="${x.id}" ${cur === x.id ? 'selected' : ''}>${x.label}</option>`).join('')}</select>`, next && !v.site ? 'Выбрано место, где давно не кололась.' : '');
    };
    let h = '';
    if (type !== 'basal') h += `<div style="margin-bottom:14px">${seg(ENTRY_TYPES, type, 'entryType', 'lg')}</div>`;
    h += field('Время', `<input class="input" type="datetime-local" id="eTime" value="${dtLocal(v.t)}">`);
    if (type === 'glucose') h += field('Сахар', numInput('eG', numVal(v.glucose), 'ммоль/л', '5,6', true));
    if (type === 'meal') {
      h += field('Сахар перед едой', numInput('eG', numVal(v.glucose), 'ммоль/л', 'если измерила'));
      h += `<div class="field"><span class="lbl">Углеводы</span><div class="row"><div class="input-unit grow"><input class="input" id="eC" inputmode="decimal" value="${carbsVal}" placeholder="0" autocomplete="off"><em id="eCU">${entryCtx.unit === 'xe' ? 'ХЕ' : 'г'}</em></div><div style="width:108px">${seg([['xe', 'ХЕ'], ['g', 'г']], entryCtx.unit, 'entryUnit')}</div></div></div>`;
      h += `<div class="grid2">${field('Короткий инсулин', numInput('eB', numVal(v.bolus), 'ЕД'))}${field('Калории', numInput('eKcal', v.kcal ? Math.round(v.kcal) : '', 'ккал', 'необяз.'))}</div>`;
      h += field('Что ела', `<input class="input" id="eFood" value="${esc(v.food || '')}" placeholder="гречка, котлета, чай">`, id ? '' : 'Удобнее через вкладку «Доза»: там продукты из базы, калории и расчёт укола.');
      h += siteSel();
    }
    if (type === 'bolus') {
      h += `<div class="grid2">${field('Короткий инсулин', numInput('eB', numVal(v.bolus), 'ЕД'))}${field('Сахар', numInput('eG', numVal(v.glucose), 'ммоль/л'))}</div>`;
      h += siteSel();
    }
    if (type === 'basal') {
      h += field('Доза' + (s.basalName ? ` · ${esc(s.basalName)}` : ''), numInput('eBa', numVal(v.basal), 'ЕД', '', true), 'Ночной инсулин — один укол в сутки, вечером. На еду он не колется.');
      h += siteSel();
    }
    if (type === 'note') {
      h += `<div class="grid2">${field('Активность', numInput('eAct', v.activity ? v.activity.min : '', 'мин'))}${field('Вид', `<select class="input" id="eActK">${ACTIVITY.map(([k, l]) => `<option value="${k}" ${v.activity && v.activity.kind === k ? 'selected' : ''}>${l}</option>`).join('')}</select>`)}</div>`;
      h += field('Кетоны', numInput('eK', numVal(v.ketones), 'ммоль/л', 'если мерила'));
    }
    h += `<div class="field"><span class="lbl">Что влияет</span><div class="chips">${C.TAGS.filter(t => t.id !== 'hypo' || entryCtx.tags.has('hypo')).map(t => `<button type="button" class="chip ${entryCtx.tags.has(t.id) ? 'on' : ''}" data-act="entryTag" data-id="${t.id}">${t.label}</button>`).join('')}</div></div>`;
    h += field('Заметка', `<textarea class="input" id="eNote" rows="2" placeholder="самочувствие, что могло повлиять">${esc(v.note || '')}</textarea>`);
    h += `<div class="btn-row">${id ? '<button class="btn danger" data-act="entryDel">Удалить</button>' : ''}<button class="btn primary" data-act="entrySave">Сохранить</button></div>`;
    return h;
  }

  function readEntryForm() {
    const out = {};
    const val = id => { const el = document.getElementById(id); return el ? el.value : undefined; };
    const t = val('eTime'); if (t !== undefined) out.t = new Date(t).getTime() || entryCtx.v.t;
    const g = val('eG'); if (g !== undefined) out.glucose = parseNum(g);
    const c = val('eC'); if (c !== undefined) { let n = parseNum(c); if (n != null && entryCtx.unit === 'xe') n *= xg(); out.carbs = n; }
    const k = val('eKcal'); if (k !== undefined) out.kcal = parseNum(k);
    const b = val('eB'); if (b !== undefined) out.bolus = parseNum(b);
    const ba = val('eBa'); if (ba !== undefined) out.basal = parseNum(ba);
    const ke = val('eK'); if (ke !== undefined) out.ketones = parseNum(ke);
    const am = val('eAct'); if (am !== undefined) { const n = parseNum(am); out.activity = n > 0 ? { kind: val('eActK') || 'walk', min: Math.round(n) } : null; }
    const fd = val('eFood'); if (fd !== undefined) out.food = fd.trim();
    const st = val('eSite'); if (st !== undefined) out.site = st;
    const nt = val('eNote'); if (nt !== undefined) out.note = nt.trim();
    return out;
  }

  function saveEntry() {
    const s = S(), isNew = !entryCtx.id;
    const b = Object.assign({}, entryCtx.v, readEntryForm());
    const e = { id: entryCtx.id || C.uid(), t: b.t || Date.now() };
    if (b.glucose != null) e.glucose = b.glucose;
    if (b.carbs > 0) e.carbs = Math.round(b.carbs * 10) / 10;
    if (b.kcal > 0) e.kcal = Math.round(b.kcal);
    if (b.protein > 0 && e.carbs) e.protein = b.protein;
    if (b.fat > 0 && e.carbs) e.fat = b.fat;
    if (b.bolus > 0) e.bolus = b.bolus;
    if (b.basal > 0) e.basal = b.basal;
    if (b.ketones != null) e.ketones = b.ketones;
    if (b.activity) e.activity = b.activity;
    const tags = [...entryCtx.tags];
    if (e.activity && !tags.includes('sport')) tags.push('sport');
    if (tags.length) e.tags = tags;
    if (b.food) e.food = b.food;
    if (b.note) e.note = b.note;
    if (b.site && (e.bolus || e.basal)) e.site = b.site;

    if (e.glucose != null && (e.glucose < 1 || e.glucose > 35)) return toast('Сахар — от 1 до 35 ммоль/л');
    if (e.carbs > 600) return toast('Проверь углеводы');
    if (e.bolus > 60) return toast('Проверь дозу короткого инсулина');
    if (e.basal > 120) return toast('Проверь дозу ночного инсулина');
    if (e.t > Date.now() + 10 * MIN) return toast('Время в будущем — проверь дату');
    if (Object.keys(e).length <= 2) return toast('Заполни хотя бы одно поле');

    if (isNew && e.basal) {
      const w = C.nightWindow(e.t);
      const prev = D.entries.filter(x => x.basal > 0 && x.t >= w.start && x.t < w.end).pop();
      if (prev && !confirm(`Ночной инсулин этой ночью уже отмечен: в ${timeStr(prev.t)}, ${fmtU(prev.basal)} ЕД.\n\nЭто точно ещё один укол?`)) return;
    }
    if (isNew && e.bolus) {
      const prev = D.entries.filter(x => x.bolus > 0 && e.t - x.t >= 0 && e.t - x.t < 2 * HOUR).pop();
      if (prev) toast(`Прошлый укол короткого был ${Math.round((e.t - prev.t) / MIN)} мин назад — дозы могут наложиться`, { ms: 5000 });
    }
    addEntryWithUndo(e, isNew);
    closeSheet();
    render();
    if (isNew && e.glucose != null && e.glucose < s.rangeLow && Date.now() - e.t < 30 * MIN) openHypo(e.glucose);
    else if (e.glucose != null && e.glucose >= s.ketoneLevel) toast('Сахар высокий — проверь кетоны и выпей воды', { ms: 5000 });
  }

  function addEntryWithUndo(e, isNew = true, msg = 'Сохранено') {
    const snap = D.supplies.map(x => [x.id, x.qty]);
    C.put('entries', e);
    if (isNew) {
      C.consumeSupplies(e);
      if (e.site) logSite(e.site, e.basal && !e.bolus ? 'basal' : 'bolus', e.t, e.id);
    }
    toast(msg, isNew ? {
      undo: () => {
        C.del('entries', e.id);
        snap.forEach(([id, q]) => { const x = D.supplies.find(y => y.id === id); if (x) x.qty = q; });
        D.siteLog = D.siteLog.filter(x => x.entry !== e.id);
        save(); render();
      },
    } : {});
  }

  /* =========================================================
     Расчёт дозы
     ========================================================= */
  const calc = { g: '', manual: '', unit: null, items: [], exercise: 0, flags: {}, touched: {}, q: '', saved: null, prefilled: false };
  const calcUnit = () => calc.unit || (S().carbMode === 'xe' ? 'xe' : 'g');
  const EXERCISE = [[0, 'Нет'], [25, 'Лёгкая'], [50, 'Средняя'], [75, 'Сильная']];

  function calcFlags() {
    const st = C.stateNow();
    const flags = {};
    for (const a of C.ADJUST) flags[a.id] = a.id in calc.touched ? !!calc.flags[a.id] : !!st.flags[a.id];
    flags.fatty = !!calc.flags.fatty;
    flags.alcohol = !!calc.flags.alcohol;
    return { flags, auto: st.flags, state: st };
  }

  function calcTotals() {
    const m = parseNum(calc.manual) || 0;
    const t = { carbs: calcUnit() === 'xe' ? m * xg() : m, kcal: 0, protein: 0, fat: 0, kcalKnown: !m };
    for (const it of calc.items) {
      const g = (parseNum(it.g) || 0) / 100;
      t.carbs += it.carbs * g;
      t.kcal += (it.kcal || 0) * g;
      t.protein += (it.protein || 0) * g;
      t.fat += (it.fat || 0) * g;
    }
    return t;
  }

  const ratioText = p => S().carbMode === 'xe' ? `${fmtU(p.ratio)} ЕД на ХЕ` : `1 ЕД на ${fmtU(p.ratio)} г`;
  const lockCard = (icon, title, text, btn, act) => `<div class="card lock"><div class="ic-big">${ic(icon, 'lg')}</div><h3>${title}</h3><p class="text-2">${text}</p><button class="btn primary" data-act="${act}">${btn}</button></div>`;

  function vCalc() {
    const s = S();
    if (!s.onboarded && !C.isConfigured()) return lockCard('sliders', 'Сначала настроим', 'Пара минут: хлебные единицы, твои коэффициенты и инсулины. Без этого я не смогу считать дозу.', 'Начать настройку', 'wizard');
    if (!C.isConfigured()) return lockCard('calc', 'Нужны твои коэффициенты', 'Впиши, сколько граммов углеводов ты считаешь за 1 ХЕ, углеводный коэффициент и ФЧИ на утро, день, вечер и ночь. Их подбирает эндокринолог.', 'Заполнить', 'wizardCoef');

    const p = C.periodFor(Date.now());
    if (calc.g === '' && !calc.prefilled) {
      const last = lastReading();
      if (last && Date.now() - last.t < 20 * MIN) calc.g = numVal(last.glucose);
      calc.prefilled = true;
    }
    const unit = calcUnit();
    const { flags, auto } = calcFlags();
    const sugg = C.adjustSuggestions();
    let h = '';
    if (calc.saved) {
      const sv = calc.saved;
      h += note('good', `Записано: ${fmtU(sv.dose)} ЕД${sv.carbs ? `, ${fmt(sv.carbs / xg())} ХЕ` : ''}`, sv.carbs && sv.wait ? `Подожди примерно ${sv.wait} минут после укола и начинай есть.` : '',
        sv.carbs && sv.wait ? `<button class="btn tonal sm mt-s" data-act="prebolus" data-min="${sv.wait}">${ic('timer', 'sm')}Таймер ${sv.wait} мин</button>` : '');
    }
    h += `<div class="row between" style="margin:0 2px 10px"><span class="period">${ic('clock', 'sm')}${p.name}: ${ratioText(p)}, ФЧИ ${fmt(p.isf)}</span>${s.adaptive ? `<span class="period" style="color:var(--accent-strong)">${ic('sparkle', 'sm')}учитываю историю</span>` : ''}</div>`;

    const tr = C.trendFor(parseNum(calc.g));
    h += `<div class="card"><label class="field mb0"><span class="lbl">Сахар сейчас</span><div class="input-unit"><input class="input big" inputmode="decimal" data-calc="g" value="${esc(calc.g)}" placeholder="—" autocomplete="off"><em>ммоль/л</em></div></label>
      <div class="hint" id="calcTrend">${tr ? `${tr.mins} мин назад было ${fmt(tr.prev.glucose)}` : ''}</div></div>`;

    const recent = D.recentFoods.map(id => allFoods().find(f => f.id === id)).filter(Boolean).slice(0, 8);
    h += `<div class="card"><div class="card-head"><h3>Еда</h3>${calc.items.length || calc.manual ? '<button class="link" data-act="calcClearFood">Очистить</button>' : ''}</div>
      <div class="input-unit"><input class="input" id="calcQ" data-calc-search placeholder="Найти продукт: гречка, яблоко…" value="${esc(calc.q)}" autocomplete="off"><em>${ic('search', 'sm')}</em></div>
      <div id="calcRes"></div>
      ${recent.length || D.dishes.length ? `<div class="chips scroll mt">${D.dishes.map(d => `<button class="chip" data-act="useDish" data-id="${d.id}">${ic('star', 'sm')}${esc(d.name)}</button>`).join('')}${recent.map(f => `<button class="chip" data-act="calcAddFood" data-id="${esc(f.id)}">${esc(f.name)}</button>`).join('')}</div>` : ''}
      <div id="calcItems">${calcItemsHtml()}</div>
      <div class="row mt" style="align-items:flex-end"><label class="field grow mb0"><span class="lbl">${calc.items.length ? 'Ещё углеводы вручную' : 'Или углеводы вручную'}</span><div class="input-unit"><input class="input" inputmode="decimal" data-calc="manual" value="${esc(calc.manual)}" placeholder="0" autocomplete="off"><em>${unit === 'xe' ? 'ХЕ' : 'г'}</em></div></label>
        <div style="width:104px;margin-bottom:5px">${seg([['xe', 'ХЕ'], ['g', 'г']], unit, 'calcUnit')}</div></div>
      <div class="totals" id="calcTotals"></div></div>`;

    const autoNames = Object.keys(auto).filter(k => flags[k]).map(k => `${C.ADJUST.find(a => a.id === k).label.toLowerCase()} (${auto[k]})`);
    h += `<div class="card"><h3>Что учитываю</h3>
      <span class="lbl">Нагрузка в ближайшие 1–2 часа</span>${seg(EXERCISE, calc.exercise, 'calcEx')}
      <div class="hint">Лёгкая — прогулка до получаса; средняя — бег, танцы до часа; сильная — долгая интенсивная тренировка.</div>
      <span class="lbl mt">Состояние</span><div class="chips">${C.ADJUST.map(a => {
        const pct = s.adjust[a.id];
        return `<button class="chip ${flags[a.id] ? 'on' : ''}" data-act="calcFlag" data-f="${a.id}">${a.label}${pct ? ` <small>${pct > 0 ? '+' : '−'}${Math.abs(pct)}%</small>` : ''}</button>`;
      }).join('')}
        <button class="chip ${flags.fatty ? 'on' : ''}" data-act="calcFlag" data-f="fatty">Жирная еда</button>
        <button class="chip ${flags.alcohol ? 'on' : ''}" data-act="calcFlag" data-f="alcohol">Алкоголь</button></div>
      ${autoNames.length ? `<div class="hint">Отмечено автоматически: ${autoNames.join(', ')}. Нажми, чтобы снять.</div>` : ''}
      ${C.ADJUST.filter(a => flags[a.id] && !s.adjust[a.id]).map(a => sugg[a.id]
        ? `<div class="hint">«${a.label}»: по твоим данным в такие дни сахар ${sugg[a.id].diff > 0 ? 'выше' : 'ниже'} на ${fmt(Math.abs(sugg[a.id].diff))}. <a href="#" data-act="applyAdjust" data-id="${a.id}" data-pct="${sugg[a.id].pct}">Поставить ${fmtS(sugg[a.id].pct, 0)}%</a></div>`
        : `<div class="hint">«${a.label}»: процент не задан, на дозу пока не влияет. <a href="#" data-act="go" data-to="settings">Задать</a></div>`).join('')}
    </div>`;

    h += `<div id="calcResult"></div>`;
    h += acc({ title: 'Как считается доза', html: `
      <p><b>Доза = еда + коррекция − активный инсулин</b>, затем поправки и округление до шага ручки (${fmtU(s.step)} ЕД).</p>
      <ul><li><b>Еда</b>: ХЕ × углеводный коэффициент текущего времени суток (у тебя 1 ХЕ = ${fmtU(s.xeGrams)} г углеводов).</li>
      <li><b>Коррекция</b>: (сахар − цель ${fmt(s.target)}) ÷ ФЧИ. Если сахар ниже цели — доза уменьшается. Если есть замер 15–90 минут назад, учитываю, куда сахар движется.</li>
      <li><b>Активный инсулин</b> — то, что ещё работает от прошлых уколов (~${fmt(s.dia)} ч). Его вычитаю из коррекции, чтобы дозы не наложились.</li>
      <li><b>Твоя история</b>: смотрю, каким был сахар через 2,5–5 часов после похожих приёмов пищи за последние 4 недели, и чуть поправляю дозу на еду (не больше +10% и −20%; если после еды бывали гипо — только вниз). Выключается в настройках.</li>
      <li><b>Состояние</b>: недавняя гипо смягчает коррекцию, нагрузка уменьшает дозу на еду, цикл и отметки в дневнике включают твои личные поправки.</li></ul>` });
    return h;
  }

  function afterCalc() {
    if (!$('#calcResult')) return;
    renderCalcSearch();
    renderCalcResult();
  }

  function calcItemsHtml() {
    if (!calc.items.length) return '';
    return `<div class="mt">${calc.items.map((it, i) => {
      const g = (parseNum(it.g) || 0) / 100;
      return `<div class="food-row"><div class="grow"><div class="t">${esc(it.name)}</div><div class="s" data-item-info="${i}">${fmt(it.carbs * g, 1)} г угл.${it.kcal ? ` · ${Math.round(it.kcal * g)} ккал` : ''}</div></div>
        <div class="input-unit"><input class="input" inputmode="decimal" data-calc-item="${i}" value="${esc(it.g)}" aria-label="Вес"><em>${it.liquid ? 'мл' : 'г'}</em></div>
        <button class="x" data-act="calcItemDel" data-i="${i}" aria-label="Убрать">${ic('x', 'sm')}</button></div>`;
    }).join('')}</div>`;
  }

  function renderCalcSearch() {
    const box = $('#calcRes');
    if (!box) return;
    const q = calc.q.trim();
    if (!q) { box.innerHTML = ''; return; }
    const list = searchFoods(q, '').slice(0, 6);
    box.innerHTML = `<div class="search-results">${list.length ? list.map(f => `<div class="res" data-act="calcAddFood" data-id="${esc(f.id)}">
      <div class="grow"><div class="t">${esc(f.name)}</div><div class="s">${foodLine(f)}</div></div><span class="plus">${ic('plus', 'sm')}</span></div>`).join('')
      : `<div class="res" data-act="foodNew"><div class="grow"><div class="t">Не нашлось</div><div class="s">Добавить свой продукт с этикетки</div></div><span class="plus">${ic('plus', 'sm')}</span></div>`}</div>`;
  }

  function renderCalcResult() {
    const box = $('#calcResult');
    if (!box) return;
    const s = S();
    const t = calcTotals();
    const tot = $('#calcTotals');
    if (tot) tot.innerHTML = t.carbs ? `<span>Углеводы <b>${fmt(t.carbs, 0)} г</b> · <b>${fmt(t.carbs / xg())} ХЕ</b></span>${t.kcal ? `<span>${t.kcalKnown ? '' : 'от продуктов '}<b>${Math.round(t.kcal)}</b> ккал</span><span>Б ${Math.round(t.protein)} · Ж ${Math.round(t.fat)} г</span>` : ''}` : '';
    calc.items.forEach((it, i) => {
      const el = $(`[data-item-info="${i}"]`), g = (parseNum(it.g) || 0) / 100;
      if (el) el.textContent = `${fmt(it.carbs * g, 1)} г угл.${it.kcal ? ` · ${Math.round(it.kcal * g)} ккал` : ''}`;
    });

    const g = parseNum(calc.g);
    if (g != null && (g < 1 || g > 35)) { box.innerHTML = note('warn', 'Проверь сахар', 'Значение должно быть от 1 до 35 ммоль/л.'); return; }
    if (g == null && !t.carbs) { box.innerHTML = '<div class="card center small muted">Введи сахар и/или еду — доза появится здесь.</div>'; return; }

    const { flags, state } = calcFlags();
    const r = C.calcBolus({ glucose: g, carbs: t.carbs, protein: t.protein, fat: t.fat, time: Date.now(), exercise: calc.exercise, flags, state });
    let h = '';
    if (r.blocked) {
      h += r.warnings.map(w => note(w.lvl, '', w.text)).join('');
      if (r.hypo) h += `<button class="btn danger block" data-act="hypo">${ic('lifebuoy', 'sm')}Помощь при гипо</button>`;
      box.innerHTML = h;
      return;
    }
    h += `<div class="card dose-card"><div class="small muted">Рекомендую</div>
      <div class="dose">${fmtU(r.dose)}<small> ЕД</small></div>
      <div class="small muted mt-s">точно ${fmt(r.exact, 2)} ЕД${r.iob >= 0.1 ? ` · ещё действует ${fmt(r.iob)} ЕД` : ''}</div>
      <div class="steps">${r.steps.map(st => `<div class="st ${st.adaptive ? 'ad' : ''}"><div class="grow"><b>${st.label}</b><span>${esc(st.how)}</span></div><div class="v">${st.val == null ? '' : (st.val >= 0 ? '+' : '−') + fmt(Math.abs(st.val), 2)}</div></div>`).join('')}</div></div>`;
    h += r.warnings.map(w => note(w.lvl, '', w.text)).join('');
    h += r.tips.map(x => note('info', '', x)).join('');
    const nextSite = suggestSite('bolus');
    h += `<div class="card"><div class="grid2">${field('Уколола', `<div class="input-unit"><input class="input" id="calcReal" inputmode="decimal" value="${numVal(r.dose)}"><em>ЕД</em></div>`)}
      ${field('Место', `<select class="input" id="calcSite"><option value="">—</option>${C.SITES.map(x => `<option value="${x.id}" ${nextSite && nextSite.id === x.id ? 'selected' : ''}>${x.label}</option>`).join('')}</select>`)}</div>
      <div class="btn-row"><button class="btn primary" data-act="calcSave">${ic('check', 'sm')}Записать</button>${calc.items.length ? '<button class="btn" data-act="saveDish">В мои блюда</button>' : ''}</div>
      <p class="hint mb0">Это подсказка по твоим коэффициентам и истории. Если что-то кажется странным — доверяй себе и врачу.</p></div>`;
    box.innerHTML = h;
  }

  function calcSave() {
    const s = S();
    const g = parseNum(calc.g);
    const t = calcTotals();
    const dose = parseNum($('#calcReal').value);
    if (dose != null && (dose < 0 || dose > 60)) return toast('Проверь дозу');
    if (dose != null && dose > s.maxBolus && !confirm(`Доза ${fmtU(dose)} ЕД больше твоего лимита ${fmtU(s.maxBolus)} ЕД. Записать?`)) return;
    const site = $('#calcSite').value;
    const { flags } = calcFlags();
    const tags = C.ADJUST.filter(a => a.id !== 'afterSport' && flags[a.id]).map(a => a.tag);
    if (calc.exercise) tags.push('sport');
    if (flags.fatty || (t.protein * 4 + t.fat * 9) / 100 >= 3) tags.push('fatty');
    if (flags.alcohol) tags.push('alcohol');
    const e = { id: C.uid(), t: Date.now() };
    if (g != null) e.glucose = g;
    if (t.carbs > 0) e.carbs = Math.round(t.carbs * 10) / 10;
    if (t.kcal > 0) { e.kcal = Math.round(t.kcal); e.protein = Math.round(t.protein * 10) / 10; e.fat = Math.round(t.fat * 10) / 10; }
    if (dose > 0) e.bolus = dose;
    if (tags.length) e.tags = [...new Set(tags)];
    if (calc.items.length) e.food = calc.items.map(it => `${it.name} ${fmt(parseNum(it.g) || 0, 0)} ${it.liquid ? 'мл' : 'г'}`).join(', ');
    if (site && dose > 0) e.site = site;
    if (Object.keys(e).length <= 2) return toast('Нечего записывать');
    addEntryWithUndo(e, true, 'Записано в дневник');
    const wait = t.carbs > 0 && dose > 0 ? (g == null ? 15 : g > 10 ? 25 : g >= 5 ? 15 : 0) : 0;
    Object.assign(calc, { g: '', manual: '', items: [], exercise: 0, flags: {}, touched: {}, q: '', saved: { dose: dose || 0, carbs: t.carbs, wait }, prefilled: true });
    render();
    window.scrollTo(0, 0);
  }

  function addFoodToCalc(f, grams) {
    calc.items.push({ id: f.id, name: f.name, carbs: f.carbs, kcal: f.kcal || 0, protein: f.protein || 0, fat: f.fat || 0, g: numVal(grams), liquid: !!f.liquid });
    D.recentFoods = [f.id, ...D.recentFoods.filter(x => x !== f.id)].slice(0, 12);
    save();
    calc.saved = null;
  }

  /* ---------- продукты ---------- */
  const allFoods = () => [...D.customFoods.map(f => Object.assign({ cat: 'my' }, f, { custom: true })), ...BASE_FOODS];
  function searchFoods(q, cat) {
    const ql = q.trim().toLowerCase();
    let list = allFoods();
    if (cat === 'fav') list = list.filter(f => D.favFoods.includes(f.id));
    else if (cat) list = list.filter(f => f.cat === cat);
    if (ql) {
      list = list.filter(f => f.name.toLowerCase().includes(ql));
      list.sort((a, b) => (b.name.toLowerCase().startsWith(ql) - a.name.toLowerCase().startsWith(ql)));
    } else if (!cat) {
      const fav = new Set(D.favFoods);
      list.sort((a, b) => (fav.has(b.id) - fav.has(a.id)) || ((b.custom ? 1 : 0) - (a.custom ? 1 : 0)));
    }
    return list;
  }
  const giTag = f => `<span class="gi ${f.gi}">${GI_LABEL[f.gi] || ''}</span>`;
  const foodLine = f => `${fmt(f.carbs, f.carbs % 1 ? 1 : 0)} г угл.${f.kcal != null ? ` · ${Math.round(f.kcal)} ккал` : ''} на 100 ${f.liquid ? 'мл' : 'г'}${f.portion ? ` · ${esc(f.portion)}${f.portionG ? ' ' + f.portionG + (f.liquid ? ' мл' : ' г') : ''}` : ''}`;
  const foodCatChips = (cur, act) => `<div class="chips scroll">${[['', 'Все'], ['fav', 'Избранное'], ...FOOD_CATS.map(c => [c.id, c.label])].map(([id, l]) => `<button class="chip ${cur === id ? 'on' : ''}" data-act="${act}" data-v="${id}">${l}</button>`).join('')}</div>`;

  let foodsQ = '', foodsCat = '';
  function vFoods() {
    return `<div class="input-unit"><input class="input" id="foodsQ" data-search="foods" placeholder="Поиск продукта" value="${esc(foodsQ)}" autocomplete="off"><em>${ic('search', 'sm')}</em></div>
      <div class="mt">${foodCatChips(foodsCat, 'foodsCat')}</div>
      <div class="card pad0 mt"><div class="list" id="foodsList"></div></div>
      ${D.dishes.length ? `<div class="section-title">Мои блюда</div><div class="card pad0"><div class="list">${D.dishes.map(d => {
        const c = d.items.reduce((a, it) => a + it.carbs * (parseNum(it.g) || 0) / 100, 0);
        return `<div class="row-item tap" data-act="dishOpen" data-id="${d.id}"><span class="lead">${ic('star', 'sm')}</span><div class="grow"><div class="t">${esc(d.name)}</div><div class="s">${fmt(c / xg())} ХЕ · ${d.items.length} ${plural(d.items.length, 'продукт', 'продукта', 'продуктов')}</div></div>${ic('chevR', 'sm chev')}</div>`;
      }).join('')}</div></div>` : ''}
      <p class="hint">Значения в базе усреднённые. Если на упаковке другое — верь упаковке и добавь продукт как свой.</p>
      ${fab('foodNew', 'Свой продукт')}`;
  }
  function renderFoodList() {
    const box = $('#foodsList');
    if (!box) return;
    const list = searchFoods(foodsQ, foodsCat);
    box.innerHTML = list.length ? list.slice(0, 200).map(f => `<div class="row-item tap" data-act="foodOpen" data-id="${esc(f.id)}">
      <div class="grow"><div class="t">${D.favFoods.includes(f.id) ? `<span style="color:var(--z-high)">${ic('star', 'sm')}</span> ` : ''}${esc(f.name)}</div><div class="s">${foodLine(f)}</div></div>${giTag(f)}</div>`).join('')
      : empty('search', 'Ничего не нашлось — добавь свой продукт.');
  }

  let foodCtx = null;
  function openFood(id) {
    const f = allFoods().find(x => x.id === id);
    if (!f) return;
    foodCtx = f;
    openSheet(f.name, `
      <p class="small text-2">${foodLine(f)} · сахар поднимает ${GI_LABEL[f.gi]}</p>
      ${field(`Сколько ${f.liquid ? 'мл' : 'граммов'}`, `<input class="input big" id="foodG" data-live="foodCalc" inputmode="decimal" value="${f.portionG || 100}">`)}
      <div class="stats" id="foodRes"></div>
      <div class="btn-row mt"><button class="btn primary" data-act="foodToCalc">В расчёт дозы</button><button class="btn" data-act="foodFav">${D.favFoods.includes(f.id) ? 'В избранном' : 'В избранное'}</button></div>
      ${f.custom ? '<div class="btn-row mt"><button class="btn" data-act="foodEdit">Изменить</button><button class="btn danger" data-act="foodDel">Удалить</button></div>' : ''}`);
    foodLive();
  }
  function foodLive() {
    const g = (parseNum($('#foodG') && $('#foodG').value) || 0) / 100, f = foodCtx;
    const box = $('#foodRes');
    if (box) box.innerHTML = `<div class="stat"><b>${fmt(f.carbs * g / xg())}</b><span>ХЕ</span></div><div class="stat"><b>${fmt(f.carbs * g, 0)} г</b><span>углеводов</span></div><div class="stat"><b>${f.kcal != null ? Math.round(f.kcal * g) : '—'}</b><span>ккал</span></div>`;
  }

  function openFoodEditor(f = null) {
    foodCtx = f;
    const v = f || { name: calc.q || '', carbs: '', kcal: '', protein: '', fat: '', gi: 'M', portion: '', portionG: '' };
    openSheet(f ? 'Изменить продукт' : 'Свой продукт', `
      ${field('Название', `<input class="input" id="fName" value="${esc(v.name)}" placeholder="например: йогурт клубничный">`)}
      <p class="small text-2">Всё на 100 г (или 100 мл) — смотри таблицу на упаковке.</p>
      <div class="grid2">${field('Углеводы', numInput('fCarbs', numVal(v.carbs), 'г'))}${field('Калории', numInput('fKcal', numVal(v.kcal), 'ккал'))}
      ${field('Белки', numInput('fProt', numVal(v.protein), 'г'))}${field('Жиры', numInput('fFat', numVal(v.fat), 'г'))}</div>
      <span class="lbl">Как быстро поднимает сахар</span><div id="fGi">${seg([['L', 'Медленно'], ['M', 'Средне'], ['H', 'Быстро']], v.gi, 'segPick')}</div>
      <div class="grid2 mt">${field('Порция', `<input class="input" id="fPortion" value="${esc(v.portion || '')}" placeholder="шт, кусок">`)}${field('Вес порции', numInput('fPortionG', numVal(v.portionG), 'г'))}</div>
      <label class="switch"><span class="t">Это напиток (в мл)</span><input type="checkbox" id="fLiquid" ${v.liquid ? 'checked' : ''}></label>
      <button class="btn primary block mt" data-act="foodSave">Сохранить</button>`, { sticky: true, focus: f ? null : '#fName' });
  }

  /* =========================================================
     Планы: дела, режим дня, запасы
     ========================================================= */
  let plansTab = 'tasks', planFilter = '';
  const PLAN_CATS = [
    { id: 'study', label: 'Учёба', color: '#4f55d9' },
    { id: 'health', label: 'Здоровье', color: '#18a058' },
    { id: 'personal', label: 'Личное', color: '#c2406e' },
    { id: 'home', label: 'Дом', color: '#e0a100' },
    { id: 'work', label: 'Работа', color: '#2f6fdb' },
    { id: 'buy', label: 'Покупки', color: '#e8724a' },
    { id: 'other', label: 'Другое', color: '#868b97' },
  ];
  const catOf = id => PLAN_CATS.find(c => c.id === id) || PLAN_CATS[PLAN_CATS.length - 1];
  const planSort = (a, b) => (a.date || '9999').localeCompare(b.date || '9999') || (b.important ? 1 : 0) - (a.important ? 1 : 0) || (a.time || '99').localeCompare(b.time || '99');

  function planRow(p) {
    const cat = catOf(p.cat);
    const overdue = !p.done && p.date && p.date < todayKey();
    const meta = [p.time, (overdue || p.done) && p.date ? dateShort(C.keyToTime(p.date)) : '', p.note].filter(Boolean).map(esc).join(' · ');
    return `<div class="row-item tap ${p.done ? 'done' : ''} ${overdue ? 'overdue' : ''}" data-act="planEdit" data-id="${p.id}">
      <button class="check ${p.done ? 'on' : ''}" data-act="planToggle" data-id="${p.id}" aria-label="Отметить выполненным">${ic('check')}</button>
      <div class="grow"><div class="t">${p.important ? `<span style="color:var(--z-high)">${ic('star', 'sm')}</span> ` : ''}${esc(p.title)}</div>
      <div class="s"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${cat.color};margin-right:5px;vertical-align:1px"></span>${cat.label}${meta ? ' · ' + meta : ''}</div></div></div>`;
  }

  function vPlans() {
    const m = S().modules;
    const tabs = [['tasks', 'Дела'], ...(m.routine ? [['routine', 'Режим дня']] : []), ...(m.supplies ? [['supplies', 'Запасы']] : [])];
    if (!tabs.some(t => t[0] === plansTab)) plansTab = 'tasks';
    let h = tabs.length > 1 ? `<div style="margin-bottom:14px">${seg(tabs, plansTab, 'plansTab', 'lg')}</div>` : '';
    if (plansTab === 'tasks') h += vTasks();
    if (plansTab === 'routine') h += vRoutine();
    if (plansTab === 'supplies') h += vSupplies();
    return h;
  }

  function vTasks() {
    const k0 = todayKey();
    const list = D.plans.filter(p => !planFilter || p.cat === planFilter);
    const open = list.filter(p => !p.done).sort(planSort);
    const done = list.filter(p => p.done).sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0));
    const group = (title, items, cls = '') => `<div class="group-head ${cls}"><b>${title}</b><span>${items.length}</span></div><div class="card pad0"><div class="list">${items.map(planRow).join('')}</div></div>`;
    let h = `<div class="chips scroll">${[['', 'Все'], ...PLAN_CATS.map(c => [c.id, c.label])].map(([id, l]) => `<button class="chip ${planFilter === id ? 'on' : ''}" data-act="planFilter" data-v="${id}">${id ? `<span class="dot" style="background:${catOf(id).color}"></span>` : ''}${l}</button>`).join('')}</div>`;
    const overdue = open.filter(p => p.date && p.date < k0);
    if (overdue.length) h += group('Просрочено', overdue, 'danger');
    const byDate = new Map();
    open.filter(p => p.date && p.date >= k0).forEach(p => { if (!byDate.has(p.date)) byDate.set(p.date, []); byDate.get(p.date).push(p); });
    for (const [date, items] of byDate) h += group(dayTitle(C.keyToTime(date)), items);
    const nodate = open.filter(p => !p.date);
    if (nodate.length) h += group('Без даты', nodate);
    if (!open.length) h += `<div class="card mt">${empty('calendar', planFilter ? 'В этой категории дел нет.' : 'Дел пока нет. Запиши первое — с датой, временем и категорией.', '<button class="btn tonal sm mt" data-act="planNew">Добавить дело</button>')}</div>`;
    if (done.length) h += `<details class="acc mt"><summary>Выполнено · ${done.length}</summary><div class="acc-body" style="padding:0"><div class="list" style="padding:0 16px">${done.slice(0, 40).map(planRow).join('')}</div><div style="padding:8px 16px 4px"><button class="btn danger sm" data-act="plansClearDone">Удалить выполненные</button></div></div></details>`;
    h += fab('planNew', 'Дело');
    return h;
  }

  let planCtx = null;
  function openPlan(id = null, preset = {}) {
    const p = id ? D.plans.find(x => x.id === id) : Object.assign({ title: '', date: todayKey(), time: '', cat: planFilter || 'personal', note: '', important: false }, preset);
    if (!p) return;
    planCtx = { id, date: p.date || '', cat: p.cat || 'personal' };
    openSheet(id ? 'Дело' : 'Новое дело', planBody(p), { sticky: true, focus: id ? null : '#pTitle' });
  }
  function planDateChips() {
    const k0 = todayKey(), k1 = C.dayKey(Date.now() + DAY), k2 = C.dayKey(Date.now() + 2 * DAY);
    return [[k0, 'Сегодня'], [k1, 'Завтра'], [k2, cap(weekdayShort(Date.now() + 2 * DAY))], ['', 'Без даты']]
      .map(([v, l]) => `<button class="chip ${planCtx.date === v ? 'on' : ''}" data-act="planDate" data-v="${v}">${l}</button>`).join('');
  }
  function planBody(p) {
    return `${field('Что сделать', `<input class="input" id="pTitle" value="${esc(p.title)}" placeholder="например: сдать лабу по Java" autocomplete="off" enterkeyhint="done">`)}
      <div class="field"><span class="lbl">Когда</span><div class="chips" id="pDates">${planDateChips()}</div>
        <div class="grid2 mt"><input class="input" type="date" id="pDate" value="${planCtx.date}" data-onchange="planDateInput" aria-label="Дата"><input class="input" type="time" id="pTime" value="${p.time || ''}" aria-label="Время"></div>
        <div class="hint">Время можно не указывать — тогда дело на весь день.</div></div>
      <div class="field"><span class="lbl">Категория</span><div class="chips" id="pCats">${PLAN_CATS.map(c => `<button class="chip ${planCtx.cat === c.id ? 'on' : ''}" data-act="planCat" data-v="${c.id}"><span class="dot" style="background:${c.color}"></span>${c.label}</button>`).join('')}</div></div>
      <label class="switch"><span class="t">Важное</span><input type="checkbox" id="pImp" ${p.important ? 'checked' : ''}></label>
      ${field('Заметка', `<textarea class="input" id="pNote" rows="2" placeholder="детали, адрес, что взять">${esc(p.note || '')}</textarea>`)}
      <div class="btn-row">${planCtx.id ? '<button class="btn danger" data-act="planDel">Удалить</button>' : ''}<button class="btn primary" data-act="planSave">Сохранить</button></div>
      ${planCtx.id && p.date ? `<button class="btn ghost block mt" data-act="planIcs">${ic('calendar', 'sm')}Добавить в календарь телефона</button>` : ''}`;
  }

  const DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const daysText = days => days.length === 7 ? 'каждый день' : days.length === 5 && ![0, 6].some(d => days.includes(d)) ? 'по будням' : days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map(d => DOW[d]).join(', ');

  function vRoutine() {
    const k = todayKey();
    const done = new Set(D.routineDone[k] || []);
    const rs = C.routineStats();
    const all = D.routine.slice().sort((a, b) => C.timeToMin(a.time) - C.timeToMin(b.time));
    const dow = new Date().getDay();
    const notif = 'Notification' in window ? Notification.permission : 'unsupported';
    let h = `<div class="card"><div class="row"><span class="lead" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent-strong)">${ic('flame')}</span>
      <div class="grow"><b>Серия: ${rs.cur} ${plural(rs.cur, 'день', 'дня', 'дней')}</b><div class="small muted">Лучшая — ${rs.best}. День засчитывается, если сделано 80% пунктов.</div></div></div></div>`;
    if (all.length) {
      h += `<div class="card pad0"><div class="list">${all.map(r => {
        const today = r.on && r.days.includes(dow);
        return `<div class="row-item tap ${done.has(r.id) ? 'done' : ''}" data-act="routineEdit" data-id="${r.id}">
          ${today ? `<button class="check ${done.has(r.id) ? 'on' : ''}" data-act="routineToggle" data-id="${r.id}" aria-label="Сделано">${ic('check')}</button>` : '<span class="check" style="opacity:.35"></span>'}
          <div class="grow"><div class="t">${esc(r.title)}</div><div class="s">${esc(r.time)} · ${daysText(r.days)}${r.on ? '' : ' · выключено'}</div></div></div>`;
      }).join('')}</div></div>`;
    } else {
      h += `<div class="card">${empty('clock', 'Режим пуст. Составь свой — или загрузи пример и поправь под себя.')}</div>`;
    }
    h += `<div class="btn-row"><button class="btn tonal" data-act="routineNew">${ic('plus', 'sm')}Пункт</button><button class="btn" data-act="routineExample">Пример</button>${all.length ? '<button class="btn" data-act="routineClear">Очистить</button>' : ''}</div>
      <div class="section-title">Напоминания</div>
      <div class="card"><p class="small text-2">Надёжнее всего — календарь телефона: он напомнит, даже если приложение закрыто.${Sync.signedIn() ? ' С онлайн-сохранением можно подписаться на календарь — он будет обновляться сам.' : ''}</p>
        <div class="btn-row">${Sync.signedIn() ? `<button class="btn tonal" data-act="go" data-to="sync">${ic('calendar', 'sm')}Подписка</button>` : ''}<button class="btn ${Sync.signedIn() ? '' : 'tonal'}" data-act="icsAll">${ic('download', 'sm')}Файл .ics</button></div>
        <p class="small text-2 mt">Ещё приложение само напоминает о режиме и ночном инсулине, пока оно открыто или свёрнуто.</p>
        ${notif === 'granted' ? `<p class="small muted mb0">Уведомления включены</p>` : notif === 'unsupported' ? '<p class="small muted mb0">Этот браузер не поддерживает уведомления.</p>' : `<button class="btn block" data-act="notifOn">${ic('bell', 'sm')}Включить уведомления</button>`}</div>
      <div class="card"><label class="switch"><span><span class="t">Пользоваться режимом дня</span><div class="s">Выключи, если не нужен: он пропадёт с главной и из календаря</div></span><input type="checkbox" data-s="modules.routine" data-type="bool" data-rerender checked></label></div>`;
    return h;
  }

  function openRoutine(id = null) {
    const r = id ? D.routine.find(x => x.id === id) : { time: '12:00', title: '', days: [0, 1, 2, 3, 4, 5, 6], on: true };
    openSheet(id ? 'Пункт режима' : 'Новый пункт', `
      <div class="grid2">${field('Время', `<input class="input" type="time" id="rTime" value="${r.time}">`)}<div></div></div>
      ${field('Что сделать', `<input class="input" id="rTitle" value="${esc(r.title)}" placeholder="например: перекус и замер">`)}
      <div class="field"><span class="lbl">Дни</span><div class="chips" id="rDays">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="chip ${r.days.includes(d) ? 'on' : ''}" data-act="chipToggle" data-v="${d}">${DOW[d]}</button>`).join('')}</div></div>
      <label class="switch"><span class="t">Включено</span><input type="checkbox" id="rOn" ${r.on ? 'checked' : ''}></label>
      <div class="btn-row mt">${id ? `<button class="btn danger" data-act="routineDel" data-id="${id}">Удалить</button>` : ''}<button class="btn primary" data-act="routineSave" data-id="${id || ''}">Сохранить</button></div>`, { sticky: true, focus: id ? null : '#rTitle' });
  }

  function vSupplies() {
    let h = `<p class="small text-2" style="margin:0 4px 12px">Укажи, сколько осталось, — посчитаю, на сколько дней хватит, и предупрежу заранее. Полоски и иглы списываются сами при каждой записи замера и укола.</p>`;
    if (D.supplies.length) {
      h += `<div class="card pad0"><div class="list">${D.supplies.map(x => {
        const d = C.supplyDays(x);
        const pct = d == null ? 0 : Math.min(100, d / 60 * 100);
        const color = d == null ? 'var(--surface-3)' : d < x.warnDays ? 'var(--z-low)' : d < x.warnDays * 2 ? 'var(--z-high)' : 'var(--z-ok)';
        return `<div class="row-item tap" data-act="supplyEdit" data-id="${x.id}"><span class="lead">${ic('box', 'sm')}</span><div class="grow"><div class="t">${esc(x.name)}</div>
          <div class="s">${x.qty == null ? 'нажми, чтобы указать количество' : `${fmt(x.qty, x.qty % 1 ? 1 : 0)} ${esc(x.unit)} · хватит на ${Math.floor(d)} ${plural(Math.floor(d), 'день', 'дня', 'дней')}`}</div>
          <div class="bar" style="margin-top:8px;height:5px"><i style="width:${pct}%;background:${color}"></i></div></div>${ic('chevR', 'sm chev')}</div>`;
      }).join('')}</div></div>`;
    } else h += `<div class="card">${empty('box', 'Список пуст. Добавь то, что хочешь отслеживать.')}</div>`;
    h += `<div class="btn-row"><button class="btn tonal" data-act="supplyNew">${ic('plus', 'sm')}Добавить</button>${D.supplies.length ? '<button class="btn" data-act="suppliesClear">Очистить список</button>' : ''}</div>
      <div class="card mt"><label class="switch"><span><span class="t">Следить за запасами</span><div class="s">Выключи, если не нужно</div></span><input type="checkbox" data-s="modules.supplies" data-type="bool" data-rerender checked></label></div>`;
    return h;
  }

  function openSupply(id = null) {
    const x = id ? D.supplies.find(s => s.id === id) : { name: '', qty: null, unit: 'шт', perDay: 1, pack: null, warnDays: 14, auto: '' };
    const missing = C.SUPPLY_TEMPLATES.filter(t => !D.supplies.some(s => s.id === t.id));
    openSheet(id ? x.name : 'Добавить в запасы', `
      ${!id && missing.length ? `<div class="field"><span class="lbl">Быстро из списка</span><div class="chips">${missing.map(t => `<button class="chip" data-act="supplyTemplate" data-id="${t.id}">${ic('plus', 'sm')}${t.name}</button>`).join('')}</div></div><hr>` : ''}
      ${field('Название', `<input class="input" id="sName" value="${esc(x.name)}" placeholder="например: батарейки для глюкометра">`)}
      ${field('Сейчас есть', `<div class="row"><div class="input-unit grow"><input class="input" id="sQty" inputmode="decimal" value="${numVal(x.qty)}" placeholder="0"><em>${esc(x.unit)}</em></div>
        <button class="btn sm" data-act="supplyAdd" data-n="-1">−1</button><button class="btn sm" data-act="supplyAdd" data-n="1">+1</button>${x.pack ? `<button class="btn tonal sm" data-act="supplyAdd" data-n="${x.pack}">+${x.pack}</button>` : ''}</div>`)}
      <div class="grid2">${field('Расход в день', numInput('sPer', numVal(Math.round(x.perDay * 1000) / 1000), esc(x.unit)))}${field('В упаковке', numInput('sPack', numVal(x.pack), esc(x.unit)))}
      ${field('Единица', `<input class="input" id="sUnit" value="${esc(x.unit)}">`)}${field('Предупредить за', numInput('sWarn', x.warnDays, 'дн.'))}</div>
      ${field('Списывать автоматически', `<select class="input" id="sAuto"><option value="" ${!x.auto ? 'selected' : ''}>нет</option><option value="glucose" ${x.auto === 'glucose' ? 'selected' : ''}>1 за каждый замер сахара</option><option value="injection" ${x.auto === 'injection' ? 'selected' : ''}>1 за каждый укол</option></select>`)}
      <div class="btn-row">${id ? `<button class="btn danger" data-act="supplyDel" data-id="${id}">Удалить</button>` : ''}<button class="btn primary" data-act="supplySave" data-id="${id || ''}">Сохранить</button></div>`, { sticky: true });
  }

  /* =========================================================
     «Ещё»
     ========================================================= */
  function vMore() {
    const syncSub = Sync.signedIn() ? `включено · ${esc(Sync.email || '')}` : 'данные в облаке и календарь';
    const items = [
      ['analysis', 'chart', 'Анализ', 'Время в цели, скачки, что подкрутить'],
      ['basal', 'moon', 'Ночной инсулин', 'Доза на сегодня и проверка по ночам'],
      ['nutrition', 'flame', 'Питание', 'Норма калорий, БЖУ и ХЕ на день'],
      ['foods', 'apple', 'Продукты', 'Углеводы и калории, свои продукты'],
      ['sites', 'pin', 'Места уколов', 'Куда колоть дальше'],
      ['report', 'file', 'Отчёт для врача', 'Сводка и дневник для печати'],
      ['knowledge', 'book', 'Справочник', 'Гипо, спорт, цикл, болезнь, алкоголь'],
      ['achievements', 'award', 'Достижения', 'Маленькие победы'],
      ['sync', 'cloud', 'Онлайн-сохранение', syncSub],
      ['settings', 'sliders', 'Настройки', 'Коэффициенты, инсулины, разделы'],
    ];
    return `<div class="card pad0"><div class="list">${items.map(([id, icon, t, s]) => `<div class="row-item tap" data-act="go" data-to="${id}"><span class="lead">${ic(icon, 'sm')}</span><div class="grow"><div class="t">${t}</div><div class="s">${s}</div></div>${ic('chevR', 'sm chev')}</div>`).join('')}</div></div>
      <div class="actions" style="grid-template-columns:1fr 1fr">
        <button class="action rose" data-act="craving"><span class="ic-wrap">${ic('cookie')}</span>Хочу сладкое</button>
        <button class="action red" data-act="hypo"><span class="ic-wrap">${ic('lifebuoy')}</span>Помощь при гипо</button>
      </div>
      <p class="hint center">СахарОК — помощник, а не медицинское изделие. Дозы и коэффициенты согласовывай с эндокринологом.</p>`;
  }

  /* =========================================================
     Анализ
     ========================================================= */
  let anDays = 14, anDay = C.startOfDay(Date.now());
  function vAnalysis() {
    const to = Date.now(), from = C.startOfDay(to) - (anDays - 1) * DAY;
    const st = C.stats(from, to + 1);
    let h = `<div style="margin-bottom:12px">${seg([[7, '7 дней'], [14, '14 дней'], [30, '30 дней'], [90, '90 дней']], anDays, 'anDays')}</div>`;
    if (!st.n) return h + `<div class="card">${empty('chart', 'За этот период нет замеров. Записывай сахар — и здесь появятся графики и подсказки.')}</div>`;
    h += `<div class="card"><div class="stats">
      <div class="stat"><b>${fmt(st.mean)}</b><span>средний сахар</span></div>
      <div class="stat"><b>${Math.round(st.ok)}%</b><span>в цели, норма от 70%</span></div>
      <div class="stat"><b>${Math.round(st.cv)}%</b><span>скачки (CV), норма до 36%</span></div>
      <div class="stat"><b>${fmt(st.a1c)}%</b><span>≈ гликированный</span></div>
      <div class="stat"><b>${st.hypos}</b><span>${plural(st.hypos, 'эпизод', 'эпизода', 'эпизодов')} гипо</span></div>
      <div class="stat"><b>${fmt(st.perDay)}</b><span>замеров в день</span></div>
    </div><div class="mt">${tirBar(st, true)}</div></div>`;

    h += `<div class="card"><div class="card-head"><h3>Сахар по часам</h3><span class="small muted">${st.n} ${plural(st.n, 'замер', 'замера', 'замеров')}</span></div>
      <div class="chart-wrap"><canvas id="profileChart" aria-label="Средний сахар по часам суток"></canvas></div>
      <div class="legend"><span><i style="background:var(--chart-line)"></i>средний</span><span><i style="background:var(--accent-soft)"></i>обычный разброс</span><span><i style="background:var(--chart-band);outline:1px solid var(--z-ok)"></i>цель</span></div>
      <p class="hint mb0">Нажми на точку, чтобы увидеть значение.</p></div>`;

    h += `<div class="card"><div class="day-nav"><button class="icon-btn" data-act="anDayPrev" aria-label="Предыдущий день">${ic('chevL')}</button><b>${dayTitle(anDay)}</b><button class="icon-btn" data-act="anDayNext" aria-label="Следующий день" ${anDay >= C.startOfDay(Date.now()) ? 'disabled' : ''}>${ic('chevR')}</button></div>
      <div class="chart-wrap"><canvas id="anDayChart" aria-label="Сахар за выбранный день"></canvas></div>${chartLegend()}</div>`;

    const ps = C.periodStats(from, to + 1);
    h += `<div class="card"><h3>По времени суток</h3><table class="tbl"><tr><th>Период</th><th class="r">Среднее</th><th class="r">В цели</th><th class="r">Низких</th><th class="r">Высоких</th></tr>
      ${ps.map(p => `<tr><td>${p.name}</td><td class="r">${p.n ? gv(p.mean) : '—'}</td><td class="r">${p.n ? Math.round(p.ok) + '%' : '—'}</td><td class="r">${p.lows}</td><td class="r">${p.highs}</td></tr>`).join('')}</table></div>`;

    h += adaptCard();
    h += `<div class="section-title">Подсказки</div>`;
    h += C.insights(anDays).map(i => note(i.lvl, esc(i.title), esc(i.text))).join('');
    h += suggestionsCard();

    const ins = C.insulinPerDay(from, to + 1);
    if (ins) {
      h += `<div class="card"><h3>Инсулин в сутки</h3><div class="stats">
        <div class="stat"><b>${fmt(ins.bolus)}</b><span>короткий, ЕД</span></div>
        <div class="stat"><b>${fmt(ins.basal)}</b><span>ночной, ЕД</span></div>
        <div class="stat"><b>${fmt(ins.total)}</b><span>всего, ЕД</span></div></div>
        <p class="small muted mt mb0">По ${ins.days} ${plural(ins.days, 'дню', 'дням', 'дням')}, где записаны оба инсулина. Ночной — ${Math.round(ins.basal / ins.total * 100)}% от суточной дозы (обычно 40–50%). В среднем ${fmt(ins.carbs / xg())} ХЕ в день.</p></div>`;
    }
    return h;
  }

  function adaptCard() {
    const s = S(), L = C.learn();
    const rows = s.periods.map(p => {
      const r = L[p.id];
      const food = r.food !== 1 ? `${fmtS((r.food - 1) * 100, 0)}%` : r.n >= 4 ? 'без поправки' : '—';
      const isf = r.isf !== 1 ? `${fmtS((1 / r.isf - 1) * 100, 0)}%` : r.nCorr >= 3 ? 'без поправки' : '—';
      return `<tr><td>${p.name}</td><td class="r">${food}</td><td class="r">${isf}</td><td class="r muted">${r.n} / ${r.nCorr}</td></tr>`;
    }).join('');
    return `<div class="card"><div class="card-head"><h3>Что я узнала о тебе</h3>${ic('sparkle', 'sm')}</div>
      <p class="small text-2">Сравниваю сахар до еды и через 2,5–5 часов после неё за последние 4 недели и поправляю расчёт дозы. Нужно хотя бы 4 приёма пищи в одно время суток (и 3 коррекции для ФЧИ).</p>
      <table class="tbl"><tr><th>Период</th><th class="r">Доза на еду</th><th class="r">Коррекция</th><th class="r">Данных</th></tr>${rows}</table>
      <label class="switch mt"><span><span class="t">Учитывать в расчёте дозы</span><div class="s">Поправка не больше +10% и −20%</div></span><input type="checkbox" data-s="adaptive" data-type="bool" data-rerender ${s.adaptive ? 'checked' : ''}></label></div>`;
  }

  function suggestionsCard() {
    const sg = C.adjustSuggestions();
    const items = C.ADJUST.filter(a => sg[a.id] && S().adjust[a.id] !== sg[a.id].pct);
    if (!items.length) return '';
    return `<div class="card"><h3>Личные поправки по твоим данным</h3>${items.map(a => `<div class="row-item"><div class="grow"><div class="t">${a.label}</div><div class="s">сахар в такие дни ${sg[a.id].diff > 0 ? 'выше' : 'ниже'} на ${fmt(Math.abs(sg[a.id].diff))} (${sg[a.id].days} дн.)</div></div>
      <button class="btn tonal sm" data-act="applyAdjust" data-id="${a.id}" data-pct="${sg[a.id].pct}">${fmtS(sg[a.id].pct, 0)}%</button></div>`).join('')}
      <p class="hint mb0">Поправка включается в расчёте дозы, когда в дневнике стоит метка или по циклу. Согласуй с врачом.</p></div>`;
  }

  function afterAnalysis() {
    const s = S(), to = Date.now(), from = C.startOfDay(to) - (anDays - 1) * DAY;
    const cv = $('#profileChart');
    if (cv) Charts.profile(cv, { hours: C.hourlyProfile(from, to + 1), low: s.rangeLow, high: s.rangeHigh, zone: C.zone });
    drawDay('anDayChart', anDay);
  }

  function drawDay(id, from) {
    const cv = document.getElementById(id);
    if (!cv) return;
    const s = S(), to = from + DAY;
    const es = D.entries.filter(e => e.t >= from && e.t < to);
    Charts.day(cv, {
      from, to, low: s.rangeLow, high: s.rangeHigh, zone: C.zone, time: timeStr,
      points: es.filter(e => e.glucose != null).map(e => ({ t: e.t, v: e.glucose })),
      boluses: es.filter(e => e.bolus > 0 || e.basal > 0).map(e => ({ t: e.t, label: [e.bolus > 0 ? `короткий ${fmtU(e.bolus)} ЕД` : '', e.basal > 0 ? `ночной ${fmtU(e.basal)} ЕД` : ''].filter(Boolean).join(', ') })),
      carbs: es.filter(e => e.carbs > 0).map(e => ({ t: e.t, label: `${fmt(e.carbs / xg())} ХЕ${e.kcal ? `, ${Math.round(e.kcal)} ккал` : ''}` })),
    });
  }

  /* =========================================================
     Ночной инсулин
     ========================================================= */
  function vBasal() {
    const s = S();
    let h = basalCard();
    const plan = C.basalPlan();
    const ba = plan.adv;
    h += note(ba.verdict === 'ok' ? 'good' : ba.verdict === 'nodata' ? 'info' : 'warn', esc(ba.title), esc(ba.text));
    if (plan.change && s.basalDose) h += `<button class="btn tonal block" data-act="basalMakeUsual" data-dose="${plan.dose}" style="margin-bottom:12px">Сделать ${fmtU(plan.dose)} ЕД обычной дозой</button>`;

    const nights = ba.nights.slice(-10).reverse();
    h += `<div class="card"><h3>Последние ночи</h3>${nights.length ? `<div class="tbl-scroll"><table class="tbl"><tr><th>Ночь</th><th class="r">Перед сном</th><th class="r">01–05</th><th class="r">Утро</th><th class="r">За ночь</th></tr>
      ${nights.map(n => `<tr><td class="nowrap">${dateShort(n.day)}${n.low ? ` <span style="color:var(--danger)">${ic('alert', 'sm')}</span>` : ''}</td><td class="r">${n.bed != null ? gv(n.bed) : '—'}</td><td class="r">${n.mid != null ? gv(n.mid) : '—'}</td><td class="r">${n.morn != null ? gv(n.morn) : '—'}</td>
        <td class="r">${n.delta != null ? `${fmtS(n.delta)}${n.clean ? '' : '*'}` : '—'}</td></tr>`).join('')}</table></div>
      <p class="hint mb0">Значок тревоги — ночью был низкий сахар. Звёздочка — за 3 часа до сна или ночью была еда или короткий укол, такая ночь в расчёт не идёт.</p>`
      : '<p class="small muted mb0">Нужны замеры перед сном (21:00–01:00) и утром (05:00–09:30).</p>'}</div>`;

    h += `<div class="card"><div class="row between"><div><b>${esc(s.basalName || 'Ночной инсулин')}</b><div class="small muted">${s.basalDose ? `обычно ${fmtU(s.basalDose)} ЕД в ${esc(s.basalTime)}` : 'доза не указана'}</div></div><button class="btn sm" data-act="wizardStep" data-step="4">Изменить</button></div></div>`;

    const ref = C.referenceEstimates();
    let refHtml = '<p>Это грубые ориентиры из учебников, а не назначение. Они помогают заметить явную ошибку в настройках.</p>';
    if (ref.byWeight) refHtml += `<p><b>По весу (${fmtU(s.weight)} кг):</b> суточная доза у взрослых обычно 0,5–0,8 ЕД/кг → ${fmt(ref.byWeight.tddLo, 0)}–${fmt(ref.byWeight.tddHi, 0)} ЕД, из них ночного 40–50% → примерно ${fmt(ref.byWeight.basalLo, 0)}–${fmt(ref.byWeight.basalHi, 0)} ЕД.</p>`;
    else refHtml += '<p class="muted">Укажи вес в разделе «Питание» — появится ориентир по весу.</p>';
    if (ref.byTdd) {
      const r = ref.byTdd;
      refHtml += `<p><b>По дневнику (${r.days} ${plural(r.days, 'день', 'дня', 'дней')}):</b> в среднем ${fmt(r.tdd)} ЕД в сутки, ночной — ${Math.round(r.basalShare)}% (обычно 40–50% → ${fmt(r.basalLo, 0)}–${fmt(r.basalHi, 0)} ЕД).</p>
        <p><b>Правило 500:</b> 1 ЕД на ~${fmt(r.gPerU, 0)} г углеводов ≈ ${fmt(r.ukPerXe)} ЕД на 1 ХЕ. <b>Правило 100:</b> ФЧИ ≈ ${fmt(r.isf)} ммоль/л на 1 ЕД.</p>`;
    } else refHtml += '<p class="muted">Ориентир по суточной дозе появится, когда наберётся 5 дней с записанным коротким и ночным инсулином.</p>';
    h += acc({ title: 'Ориентиры для разговора с врачом', html: refHtml });
    h += KNOWLEDGE.filter(k => k.id === 'basal').map(acc).join('');
    return h;
  }

  /* =========================================================
     Питание
     ========================================================= */
  let nutriEdit = false;
  function vNutrition() {
    const norm = C.nutritionNorm();
    if (!norm || nutriEdit) return profileForm(true);
    const d0 = C.startOfDay(Date.now()), day = C.nutritionDay(d0, Date.now() + MIN);
    let h = `<div class="card"><div class="small muted">Твоя норма в день</div><div class="big-num" style="margin:4px 0 6px">${norm.kcal}<small>ккал</small></div>
      <div class="small text-2">ИМТ ${fmt(norm.bmi)} — ${norm.bmiCat} · вода около ${norm.water} мл</div>
      <div class="stats mt"><div class="stat"><b>${norm.protein} г</b><span>белки</span></div><div class="stat"><b>${norm.fat} г</b><span>жиры</span></div><div class="stat"><b>${norm.carbs} г</b><span>углеводы${norm.xe ? ` ≈ ${fmt(norm.xe, 0)} ХЕ` : ''}</span></div></div>
      ${norm.warnings.map(w => `<div class="mt">${note('info', '', esc(w))}</div>`).join('')}
      <button class="btn ghost sm" data-act="nutriEdit" style="margin:8px 0 -6px -8px">Изменить данные</button></div>`;
    h += `<div class="card"><div class="card-head"><h3>Сегодня</h3><span class="small muted">${day.meals} ${plural(day.meals, 'приём', 'приёма', 'приёмов')} пищи</span></div>
      ${meter('Калории', day.kcal, norm.kcal, 'ккал')}
      ${norm.xe ? meter('Углеводы', day.carbs / xg(), norm.xe, 'ХЕ', 1) : meter('Углеводы', day.carbs, norm.carbs, 'г')}
      ${meter('Белки', day.protein, norm.protein, 'г')}
      ${meter('Жиры', day.fat, norm.fat, 'г')}
      ${day.unknownKcal ? `<div class="hint">${day.unknownKcal} ${plural(day.unknownKcal, 'приём', 'приёма', 'приёмов')} без калорий. Через вкладку «Доза» калории и БЖУ считаются сами.</div>` : ''}</div>`;
    h += `<div class="card"><h3>Как распределить за день</h3><table class="tbl"><tr><th>Приём пищи</th><th class="r">Ккал</th><th class="r">${norm.xe ? 'ХЕ' : 'Угл., г'}</th></tr>
      ${norm.meals.map(m => `<tr><td>${m.name}</td><td class="r">${Math.round(m.kcal / 10) * 10}</td><td class="r">${norm.xe ? fmt(m.xe) : Math.round(m.carbs)}</td></tr>`).join('')}</table>
      <p class="hint mb0">При диабете 1 типа помогает примерно одинаковое количество углеводов в одни и те же приёмы пищи — так проще подобрать коэффициенты.</p></div>`;
    const days = [];
    for (let i = 6; i >= 0; i--) { const t = C.startOfDay(Date.now() - i * DAY + 2 * HOUR); days.push([t, C.nutritionDay(t, t + DAY)]); }
    h += `<div class="card"><h3>Последние 7 дней</h3><table class="tbl"><tr><th>День</th><th class="r">Ккал</th><th class="r">ХЕ</th><th class="r">Б / Ж, г</th></tr>
      ${days.map(([t, d]) => `<tr><td>${cap(weekdayShort(t))}, ${new Date(t).getDate()}</td><td class="r">${d.kcal ? Math.round(d.kcal) : '—'}</td><td class="r">${d.carbs ? fmt(d.carbs / xg()) : '—'}</td><td class="r">${d.protein || d.fat ? `${Math.round(d.protein)} / ${Math.round(d.fat)}` : '—'}</td></tr>`).join('')}</table></div>`;
    h += acc({ title: 'Как посчитана норма', html: `
      <p>Базовый обмен — по формуле Миффлина — Сан Жеора: ${fmt(norm.bmr, 0)} ккал. Это энергия на дыхание, сердце и мозг в полном покое.</p>
      <p>Умножаю на коэффициент активности «${norm.level.label.toLowerCase()}» (×${String(norm.level.k).replace('.', ',')}) — получается ${fmt(norm.tdee, 0)} ккал${norm.goal === 'keep' ? '' : `, и поправляю под цель «${C.GOALS.find(g => g.id === norm.goal).label.toLowerCase()}»`}.</p>
      <p>Белки — ${norm.goal === 'lose' ? '1,4' : norm.goal === 'gain' ? '1,5' : '1,2'} г на кг веса, жиры — 30% калорий, остальное — углеводы.</p>
      <p><b>Важно:</b> при диабете 1 типа нельзя снижать вес пропуском инсулина или еды после укола — это опасно. Если хочется изменить вес, лучше обсудить план с эндокринологом.</p>` });
    return h;
  }

  function profileForm(standalone) {
    const s = S();
    return `<div class="card">${standalone ? '<h3>Данные для расчёта нормы</h3><p class="small text-2">Норма калорий зависит от пола, возраста, роста, веса и активности.</p>' : ''}
      <span class="lbl">Пол</span>${seg([['f', 'Женский'], ['m', 'Мужской']], s.sex, 'setSex')}
      <div class="grid3 mt">${sNum('Возраст', 'age', s.age, 'лет', { int: true, min: 10, max: 100 })}${sNum('Рост', 'height', s.height, 'см', { min: 120, max: 220 })}${sNum('Вес', 'weight', s.weight, 'кг', { min: 30, max: 200 })}</div>
      <span class="lbl">Активность</span>${C.ACTIVITY_LEVELS.map(a => `<button class="option" data-act="setActivity" data-v="${a.id}" style="${s.activity === a.id ? 'border-color:var(--accent);background:var(--accent-soft)' : ''}"><div class="grow"><b>${a.label}</b><span>${a.hint}</span></div>${s.activity === a.id ? ic('check') : ''}</button>`).join('')}
      <span class="lbl">Цель</span>${seg(C.GOALS.map(g => [g.id, g.label]), s.goal, 'setGoal')}
      ${standalone ? '<button class="btn primary block mt" data-act="nutriDone">Посчитать</button>' : ''}</div>`;
  }

  /* =========================================================
     Места уколов, достижения, справочник
     ========================================================= */
  function siteLast() {
    const last = {};
    for (const x of D.siteLog) if (!last[x.site] || x.t > last[x.site].t) last[x.site] = x;
    return last;
  }
  function suggestSite(kind) {
    const areas = kind === 'basal' ? ['thigh', 'butt'] : ['belly', 'arm'];
    const last = siteLast();
    return C.SITES.filter(x => areas.includes(x.area)).sort((a, b) => (last[a.id] ? last[a.id].t : 0) - (last[b.id] ? last[b.id].t : 0))[0];
  }
  function logSite(site, kind, t = Date.now(), entry = null) {
    D.siteLog.push({ t, site, kind, entry });
    if (D.siteLog.length > 400) D.siteLog = D.siteLog.slice(-400);
    save();
  }

  function vSites() {
    const last = siteLast();
    const nb = suggestSite('bolus'), nl = suggestSite('basal');
    const days = id => last[id] ? (Date.now() - last[id].t) / DAY : null;
    return note('info', 'Куда колоть дальше', `Короткий — <b>${nb.label.toLowerCase()}</b>, ночной — <b>${nl.label.toLowerCase()}</b>. Каждый следующий укол — на 2–3 см от предыдущего.`) +
      `<div class="sites">${C.SITES.map(x => {
        const d = days(x.id);
        const rest = d == null ? 100 : Math.min(100, d / 7 * 100);
        return `<button class="site ${x.id === nb.id || x.id === nl.id ? 'next' : ''}" data-act="siteLog" data-id="${x.id}">
          <b>${x.label}</b><span>${d == null ? 'ещё не отмечено' : d < 1 ? `сегодня, ${timeStr(last[x.id].t)}` : `${Math.floor(d)} ${plural(Math.floor(d), 'день', 'дня', 'дней')} назад`}</span>
          <div class="bar"><i style="width:${rest}%;background:${rest < 30 ? 'var(--z-low)' : rest < 70 ? 'var(--z-high)' : 'var(--z-ok)'}"></i></div></button>`;
      }).join('')}</div>
      <p class="hint">Полоска — насколько место «отдохнуло»: полная — неделя и больше. Место отмечается само, когда записываешь укол; нажми на карточку, чтобы отметить вручную.</p>
      ${KNOWLEDGE.filter(k => k.id === 'inject').map(acc).join('')}`;
  }

  function vAchievements() {
    const list = C.achievements();
    const done = list.filter(a => a.done).length;
    return `<p class="text-2" style="margin:0 4px 12px">Открыто ${done} из ${list.length}.</p>
      <div class="badges">${list.map(a => `<div class="badge ${a.done ? '' : 'off'}"><span class="ic-wrap">${ic(a.icon)}</span><b>${a.title}</b><span>${a.text}</span>
        ${a.done ? '<span style="color:var(--good);font-weight:600;margin-top:6px">Получено</span>' : `<div class="bar"><i style="width:${a.cur / a.goal * 100}%"></i></div><span class="tiny mt-s">${fmt(a.cur, 0)} из ${a.goal}</span>`}</div>`).join('')}</div>`;
  }

  function vKnowledge() {
    return `<p class="text-2" style="margin:0 4px 12px">Короткие ответы на главные вопросы. Если врач советует иначе — слушай врача.</p>${KNOWLEDGE.map(acc).join('')}`;
  }

  /* =========================================================
     Отчёт для врача
     ========================================================= */
  let repDays = 30;
  function vReport() {
    const s = S(), to = Date.now(), from = C.startOfDay(to) - (repDays - 1) * DAY;
    const st = C.stats(from, to + 1);
    const ps = C.periodStats(from, to + 1);
    const ins = C.insulinPerDay(from, to + 1);
    const days = C.dailySummary(from, to + 1).reverse();
    const cell = (k, pid) => D.entries.filter(e => e.glucose != null && C.dayKey(e.t) === k && C.periodFor(e.t).id === pid).map(e => fmt(e.glucose)).join(' ');
    return `<div class="no-print"><div style="margin-bottom:12px">${seg([[14, '14 дней'], [30, '30 дней'], [90, '90 дней']], repDays, 'repDays')}</div>
      <div class="btn-row" style="margin-bottom:12px"><button class="btn primary" data-act="print">${ic('file', 'sm')}Печать / PDF</button><button class="btn" data-act="exportCsv">Таблица CSV</button></div></div>
      <div class="card"><h2 class="mb0">Дневник самоконтроля${s.name ? ': ' + esc(s.name) : ''}</h2>
        <p class="small muted">${dateShort(from)} — ${dateShort(to)} · сформирован ${new Date().toLocaleDateString('ru-RU')}</p>
        <table class="tbl">
          <tr><td>Короткий инсулин</td><td>${esc(s.bolusName || '—')}, шаг ${fmtU(s.step)} ЕД</td></tr>
          <tr><td>Ночной инсулин</td><td>${esc(s.basalName || '—')}${s.basalDose ? `, ${fmtU(s.basalDose)} ЕД в ${esc(s.basalTime)}` : ''}</td></tr>
          <tr><td>Коэффициенты (${s.carbMode === 'xe' ? 'ЕД/ХЕ' : 'г/ЕД'}; ФЧИ)</td><td>${s.periods.map(p => `${p.name} с ${p.start}:00 — ${p.ratio ? fmtU(p.ratio) : '—'}; ${p.isf ? fmt(p.isf) : '—'}`).join('<br>')}</td></tr>
          <tr><td>Цель / диапазон</td><td>${fmt(s.target)} / ${fmt(s.rangeLow)}–${fmt(s.rangeHigh)} ммоль/л, 1 ХЕ = ${s.xeGrams ? fmtU(s.xeGrams) : '—'} г</td></tr>
        </table></div>
      ${st.n ? `<div class="card"><h3>Сводка</h3><div class="stats">
        <div class="stat"><b>${fmt(st.mean)}</b><span>средний ± ${fmt(st.sd)}</span></div>
        <div class="stat"><b>${Math.round(st.ok)}%</b><span>в цели</span></div>
        <div class="stat"><b>${Math.round(st.cv)}%</b><span>вариабельность</span></div>
        <div class="stat"><b>${fmt(st.a1c)}%</b><span>≈ HbA1c по среднему</span></div>
        <div class="stat"><b>${st.hypos}</b><span>эпизодов гипо</span></div>
        <div class="stat"><b>${fmt(st.perDay)}</b><span>замеров в день</span></div></div>
        <div class="mt">${tirBar(st, true)}</div>
        ${ins ? `<p class="small mt mb0">Инсулин в сутки: короткий ${fmt(ins.bolus)} ЕД, ночной ${fmt(ins.basal)} ЕД, всего ${fmt(ins.total)} ЕД; углеводы ${fmt(ins.carbs / xg())} ХЕ/сут.</p>` : ''}</div>
      <div class="card"><h3>По времени суток</h3><table class="tbl"><tr><th>Период</th><th class="r">Среднее</th><th class="r">В цели</th><th class="r">Низких</th><th class="r">Замеров</th></tr>
        ${ps.map(p => `<tr><td>${p.name}</td><td class="r">${p.n ? fmt(p.mean) : '—'}</td><td class="r">${p.n ? Math.round(p.ok) + '%' : '—'}</td><td class="r">${p.lows}</td><td class="r">${p.n}</td></tr>`).join('')}</table></div>
      <div class="card"><h3>Дневник</h3><div class="tbl-scroll"><table class="tbl"><tr><th>Дата</th>${s.periods.map(p => `<th>${p.name}</th>`).join('')}<th class="r">ХЕ</th><th class="r">Кор.</th><th class="r">Ночн.</th></tr>
        ${days.map(d => `<tr><td class="nowrap">${dateShort(C.keyToTime(d.key))}${d.tags.size ? `<br><span class="tiny muted">${[...d.tags].map(t => (C.TAGS.find(x => x.id === t) || {}).label || '').join(', ')}</span>` : ''}</td>${s.periods.map(p => `<td class="num">${cell(d.key, p.id)}</td>`).join('')}
          <td class="r">${d.carbs ? fmt(d.carbs / xg()) : ''}</td><td class="r">${d.bolus ? fmtU(d.bolus) : ''}</td><td class="r">${d.basal ? fmtU(d.basal) : ''}</td></tr>`).join('')}</table></div></div>`
      : `<div class="card">${empty('file', 'За этот период нет замеров.')}</div>`}`;
  }

  /* =========================================================
     Настройки
     ========================================================= */
  function vSettings() {
    const s = S();
    const xe = s.carbMode === 'xe';
    const bolusPreset = C.BOLUS_INSULINS.find(b => b.name === s.bolusName) ? s.bolusName : (s.bolusName ? '__other' : '');
    const sg = C.adjustSuggestions();
    const sw = (path, title, sub, on) => `<label class="switch"><span><span class="t">${title}</span>${sub ? `<div class="s">${sub}</div>` : ''}</span><input type="checkbox" data-s="${path}" data-type="bool" data-rerender ${on ? 'checked' : ''}></label>`;
    return `
    <div class="section-title">Обо мне</div>
    <div class="card">
      ${field('Имя', `<input class="input" data-s="name" value="${esc(s.name)}" autocomplete="off">`)}
      <div class="row-item tap" data-act="go" data-to="nutrition" style="padding-bottom:0"><div class="grow"><div class="t">Рост, вес, активность</div><div class="s">${s.height && s.weight ? `${s.height} см, ${fmtU(s.weight)} кг, ${s.age || '?'} лет` : 'не указано'} — для нормы калорий</div></div>${ic('chevR', 'sm chev')}</div>
    </div>

    <div class="section-title">Хлебные единицы и коэффициенты</div>
    <div class="card">
      ${sNum('Сколько граммов углеводов в 1 ХЕ', 'xeGrams', s.xeGrams, 'г', { min: 8, max: 20, ph: 'например, 12', hint: 'Как учили в школе диабета или как сказал врач — чаще всего 10 или 12.' })}
      <span class="lbl">Как записан углеводный коэффициент</span>
      ${seg([['xe', 'ЕД на 1 ХЕ'], ['g', '1 ЕД на X г']], s.carbMode, 'carbMode')}
      <table class="coef-table mt"><tr><th></th><th>С, ч</th><th>${xe ? 'ЕД на ХЕ' : 'г на 1 ЕД'}</th><th>ФЧИ</th></tr>
        ${s.periods.map((p, i) => `<tr><td>${p.name}</td>
          <td><input class="input" inputmode="numeric" data-s="periods.${i}.start" data-type="int" data-min="0" data-max="23" value="${p.start}" aria-label="${p.name}: начало, час"></td>
          <td><input class="input" inputmode="decimal" data-s="periods.${i}.ratio" data-type="num" data-min="${xe ? 0.1 : 2}" data-max="${xe ? 6 : 60}" value="${numVal(p.ratio)}" placeholder="—" aria-label="${p.name}: углеводный коэффициент"></td>
          <td><input class="input" inputmode="decimal" data-s="periods.${i}.isf" data-type="num" data-min="0.3" data-max="12" value="${numVal(p.isf)}" placeholder="—" aria-label="${p.name}: ФЧИ"></td></tr>`).join('')}
      </table>
      <p class="hint">${xe ? '<b>Углеводный коэффициент</b> — сколько единиц короткого инсулина нужно на 1 ХЕ.' : '<b>Углеводный коэффициент</b> — сколько граммов углеводов покрывает 1 единица.'} <b>ФЧИ</b> — на сколько ммоль/л снижает сахар 1 единица. «С, ч» — со скольки часов начинается период.</p>
      <div class="grid2 mt">${sNum('Целевой сахар', 'target', s.target, 'ммоль/л', { min: 4, max: 9 })}${sNum('Лимит одной дозы', 'maxBolus', s.maxBolus, 'ЕД', { min: 1, max: 60 })}</div>
      ${sw('adaptive', 'Учитывать мою историю', 'Слегка поправлять дозу по тому, как сахар вёл себя после похожей еды (не больше +10% и −20%)', s.adaptive)}
    </div>

    <div class="section-title">Короткий инсулин</div>
    <div class="card">
      ${field('Какой', `<select class="input" data-onchange="bolusPreset"><option value="" ${!bolusPreset ? 'selected' : ''}>выбери</option>${C.BOLUS_INSULINS.map(b => `<option value="${esc(b.name)}" ${bolusPreset === b.name ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}<option value="__other" ${bolusPreset === '__other' ? 'selected' : ''}>Другой</option></select>`)}
      ${bolusPreset === '__other' ? field('Название', `<input class="input" data-s="bolusName" value="${esc(s.bolusName)}">`) : ''}
      <div class="grid2">${sNum('Действует', 'dia', s.dia, 'ч', { min: 2, max: 8 })}${sNum('Пик через', 'peak', s.peak, 'мин', { min: 30, max: 200 })}</div>
      <span class="lbl">Шаг ручки</span>${seg([[0.5, '0,5 ЕД'], [1, '1 ЕД']], s.step, 'step')}
    </div>

    <div class="section-title">Ночной инсулин</div>
    <div class="card">
      ${field('Какой', `<select class="input" data-s="basalName"><option value="">выбери</option>${[...C.BASAL_INSULINS, ...(s.basalName && !C.BASAL_INSULINS.includes(s.basalName) ? [s.basalName] : [])].map(n => `<option ${s.basalName === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`)}
      <div class="grid2">${sNum('Обычная доза', 'basalDose', s.basalDose, 'ЕД', { min: 1, max: 120 })}${field('Время укола', `<input class="input" type="time" data-s="basalTime" value="${esc(s.basalTime)}">`)}</div>
      <span class="lbl">Шаг ручки</span>${seg([[1, '1 ЕД'], [0.5, '0,5 ЕД']], s.basalStep, 'basalStep')}
      <p class="hint mb0">Один укол в сутки. Каждый вечер на главной будет доза на эту ночь — с учётом прошлых ночей и того, была ли сегодня нагрузка.</p>
    </div>

    <div class="section-title">Сахар</div>
    <div class="card"><div class="grid2">
      ${sNum('Нижняя граница', 'rangeLow', s.rangeLow, 'ммоль/л', { min: 3, max: 5 })}${sNum('Верхняя граница', 'rangeHigh', s.rangeHigh, 'ммоль/л', { min: 7, max: 14 })}
      ${sNum('Кетоны проверять от', 'ketoneLevel', s.ketoneLevel, 'ммоль/л', { min: 10, max: 20 })}${sNum('Углеводы при гипо', 'hypoCarbs', s.hypoCarbs, 'г', { min: 10, max: 30 })}
    </div><p class="hint mb0">Международный стандарт: в цели 3,9–10, гипо ниже 3,9, кетоны проверять от 13,9.</p></div>

    <div class="section-title">Мои поправки к дозе, %</div>
    <div class="card">
      <p class="small text-2">Включаются в расчёте дозы сами — по отметкам в дневнике, циклу и нагрузке. 0% — без изменений.</p>
      ${C.ADJUST.map(a => sNum(a.label, `adjust.${a.id}`, s.adjust[a.id], '%', { min: -50, max: 50, hint: a.hint + (sg[a.id] ? ` · по твоим данным: ${fmtS(sg[a.id].pct, 0)}%` : '') })).join('')}
    </div>

    <div class="section-title">Разделы</div>
    <div class="card">
      ${sw('modules.routine', 'Режим дня', 'Распорядок с отметками и напоминаниями', s.modules.routine)}
      ${sw('modules.supplies', 'Запасы', 'Полоски, иглы, инсулин — сколько осталось', s.modules.supplies)}
      ${sw('modules.nutrition', 'Питание и калории', 'Норма и учёт на главной', s.modules.nutrition)}
      ${sw('modules.cycle', 'Менструальный цикл', 'Подсказки и поправки по фазам', s.modules.cycle)}
      ${s.modules.cycle ? sNum('Обычная длина цикла', 'cycleLength', s.cycleLength, 'дней', { int: true, min: 20, max: 45, hint: 'После трёх отметок посчитается сама.' }) : ''}
      ${D.cycleStarts.length ? `<p class="small muted mb0">Отмечено: ${D.cycleStarts.slice(-4).map(k => dateShort(C.keyToTime(k))).join(', ')} · <a href="#" data-act="cycleUndo">убрать последнее</a></p>` : ''}
    </div>

    <div class="section-title">Записки поддержки</div>
    <div class="card">
      <p class="small text-2">Сюда близкий человек может написать тёплые слова — по одной на строку. Они будут появляться на главной через день.</p>
      ${field('От кого', `<input class="input" data-s="loveFrom" value="${esc(s.loveFrom)}" placeholder="имя — будет подписью">`)}
      <textarea class="input" data-onchange="loveNotes" rows="5" placeholder="Я горжусь тобой&#10;Ты справляешься лучше, чем думаешь" aria-label="Записки">${esc(s.loveNotes.join('\n'))}</textarea>
    </div>

    <div class="section-title">Оформление</div>
    <div class="card">${seg([['auto', 'Как в системе'], ['light', 'Светлая'], ['dark', 'Тёмная']], s.theme, 'setTheme')}</div>

    <div class="section-title">Данные</div>
    <div class="card">
      <div class="row-item tap" data-act="go" data-to="sync" style="padding-top:0"><span class="lead">${ic('cloud', 'sm')}</span><div class="grow"><div class="t">Онлайн-сохранение</div><div class="s">${Sync.signedIn() ? 'включено' : 'выключено — данные только на этом устройстве'}</div></div>${ic('chevR', 'sm chev')}</div>
      <p class="small muted">${D.entries.length} ${plural(D.entries.length, 'запись', 'записи', 'записей')} в дневнике.${s.lastBackup ? ` Копия файлом: ${dateShort(s.lastBackup)}.` : ''}</p>
      <div class="btn-row"><button class="btn" data-act="exportJson">${ic('download', 'sm')}Копия</button><button class="btn" data-act="importJson">${ic('upload', 'sm')}Восстановить</button></div>
      <div class="btn-row mt"><button class="btn" data-act="exportCsv">Дневник в Excel</button><button class="btn" data-act="wizard">Мастер настройки</button></div>
      <input type="file" id="importFile" accept=".json,application/json" hidden>
      <button class="btn danger block mt" data-act="resetAll">Удалить все данные</button>
    </div>
    <p class="hint center">СахарОК — помощник, а не медицинское изделие. Расчёты основаны на введённых тобой коэффициентах.</p>`;
  }

  function setPath(obj, path, val) {
    const keys = path.split('.');
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
    o[keys[keys.length - 1]] = val;
  }

  const REQUIRED = /^(target|rangeLow|rangeHigh|dia|peak|maxBolus|ketoneLevel|hypoCarbs|cycleLength|periods\.\d\.start)$/;
  function onSetting(el, quiet = false) {
    const type = el.dataset.type || 'str';
    let v = el.type === 'checkbox' ? el.checked : el.value;
    if (type === 'num' || type === 'int') {
      v = type === 'int' ? parseInt(v, 10) : parseNum(v);
      if (v == null || isNaN(v)) v = null;
      const mn = parseFloat(el.dataset.min), mx = parseFloat(el.dataset.max);
      if (v != null && ((!isNaN(mn) && v < mn) || (!isNaN(mx) && v > mx))) {
        if (!quiet) toast(`Проверь значение: от ${numVal(mn)} до ${numVal(mx)}`, { ms: 3500 });
        return false;
      }
      if (v == null && REQUIRED.test(el.dataset.s)) { if (!quiet) toast('Это поле нужно заполнить'); return false; }
      if (v == null && el.dataset.s.startsWith('adjust.')) v = 0;
    }
    setPath(D.settings, el.dataset.s, v);
    touch();
    if (!quiet && el.dataset.rerender !== undefined) render();
    return true;
  }

  function applyTheme() {
    const t = S().theme;
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }

  /* =========================================================
     Онлайн-сохранение
     ========================================================= */
  function vSync() {
    let h = `<p class="text-2" style="margin:0 4px 12px">Дневник, настройки и планы хранятся в облаке и не потеряются, если с телефоном что-то случится. Приложение работает и без интернета — изменения отправятся, когда появится сеть.</p>`;
    if (!Sync.configured()) {
      h += `<div class="card"><h3>Подключить сервер</h3>
        <p class="small text-2">Нужен бесплатный проект Supabase — пошаговая инструкция есть в README. Эти два значения можно один раз вписать в файл js/config.js, тогда здесь их вводить не придётся.</p>
        ${field('Адрес проекта (Project URL)', `<input class="input" id="sbUrl" value="${esc(Sync.url())}" placeholder="https://xxxx.supabase.co" autocomplete="off">`)}
        ${field('Публичный ключ (Publishable / anon key)', `<input class="input" id="sbKey" value="${esc(Sync.key())}" placeholder="sb_publishable_… или eyJ…" autocomplete="off">`)}
        <button class="btn primary block" data-act="syncSaveCfg">Сохранить</button></div>`;
    } else if (!Sync.signedIn()) {
      h += `<div class="card"><h3>Вход</h3>
        ${field('Почта', `<input class="input" id="sbEmail" type="email" value="${esc(Sync.email || '')}" autocomplete="email">`)}
        ${field('Пароль', `<input class="input" id="sbPass" type="password" autocomplete="current-password" placeholder="не короче 6 символов">`)}
        <div class="btn-row"><button class="btn primary" data-act="syncSignIn">Войти</button><button class="btn" data-act="syncSignUp">Создать аккаунт</button></div>
        ${Sync.error ? `<div class="mt">${note('warn', '', esc(Sync.error))}</div>` : ''}
        <p class="hint mb0">Если данные уже есть в облаке, они подтянутся на это устройство и сольются с тем, что записано здесь.</p></div>
        ${Sync.fromConfig() ? '' : '<button class="btn ghost sm" data-act="syncResetCfg">Изменить адрес сервера</button>'}`;
    } else {
      const st = Sync.status;
      const lbl = { ok: 'Всё сохранено', syncing: 'Сохраняю…', error: 'Ошибка', offline: 'Нет сети — сохраню позже', idle: 'Подключено', off: 'Подключено' }[st] || st;
      h += `<div class="card"><div class="row"><span class="lead" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent-strong)">${ic('cloud')}</span>
        <div class="grow"><b>${lbl}</b><div class="small muted">${esc(Sync.email || '')}${Sync.lastSync ? ` · ${ago(Sync.lastSync)}` : ''}</div></div></div>
        ${st === 'error' ? `<div class="mt">${note('warn', '', esc(Sync.error))}</div>` : ''}
        <div class="btn-row mt"><button class="btn tonal" data-act="syncNow">${ic('refresh', 'sm')}Сохранить сейчас</button><button class="btn" data-act="syncOut">Выйти</button></div></div>`;
      const cal = Sync.calendarUrl();
      h += `<div class="section-title">Календарь телефона</div><div class="card">
        <p class="small text-2">Подпишись на этот адрес — в календаре появятся дела с датами, режим дня и ночной инсулин, с напоминаниями. Календарь будет обновляться сам.</p>
        ${cal ? `<div class="copy-box"><span class="grow">${esc(cal)}</span><button class="icon-btn" data-act="copyCal" aria-label="Скопировать">${ic('copy')}</button></div>` : '<p class="small muted">Ссылка появится после первого сохранения.</p>'}
        <div class="mt">${acc({ title: 'iPhone: как подписаться', html: '<ol><li>Скопируй ссылку выше.</li><li>Настройки → Приложения → Календарь → Учётные записи → Новая учётная запись → Другое → Подписной календарь.</li><li>Вставь ссылку → Далее → Сохранить.</li><li>Там же выключи «Удалить предупреждения», чтобы приходили напоминания.</li></ol>' })}
        ${acc({ title: 'Android: как подписаться', html: '<ol><li>На компьютере открой calendar.google.com под тем же аккаунтом, что на телефоне.</li><li>Слева «Другие календари» → «+» → «Добавить по URL» → вставь ссылку.</li><li>Google обновляет такие календари раз в несколько часов и не всегда присылает по ним уведомления. Для точных напоминаний скачай файл ниже и открой его на телефоне — события добавятся в твой календарь.</li></ol>' })}</div>
        <button class="btn block" data-act="icsAll">${ic('download', 'sm')}Скачать файл .ics</button></div>`;
    }
    return h;
  }

  /* =========================================================
     Мастер первой настройки
     ========================================================= */
  let wiz = 0;
  const WIZ = ['Привет', 'О тебе', 'Хлебные единицы', 'Коэффициенты', 'Инсулины', 'Готово'];
  function openWizard(step = 0) { wiz = step; openSheet(WIZ[wiz], wizBody(), { sticky: true }); }
  function wizRefresh() { setSheetTitle(WIZ[wiz]); setSheetBody(wizBody()); const sh = $('.sheet'); if (sh) sh.scrollTop = 0; }
  function wizBody() {
    const s = S(), xe = s.carbMode === 'xe';
    const dots = `<div class="wizard-dots">${WIZ.map((_, i) => `<i class="${i <= wiz ? 'on' : ''}"></i>`).join('')}</div>`;
    const nav = (next = 'Дальше', skip = false) => `<div class="btn-row mt">${wiz ? '<button class="btn" data-act="wizBack">Назад</button>' : ''}${skip ? '<button class="btn" data-act="wizSkip">Позже</button>' : ''}<button class="btn primary" data-act="wizNext">${next}</button></div>`;
    let h = dots;
    if (wiz === 0) {
      h += `<p>Я — твой помощник с диабетом: дневник, расчёт дозы с учётом твоей истории, ночной инсулин, питание, ежедневник и поддержка в трудные минуты.</p>
        ${note('warn', 'Важно', 'Я не врач и не медицинское изделие. Расчёты основаны на коэффициентах, которые ты введёшь, — их подбирает эндокринолог. Если расчёт кажется странным, доверяй себе и врачу.')}
        ${field('Как тебя зовут?', `<input class="input" data-s="name" value="${esc(s.name || 'Аля')}" autocomplete="off">`)}
        <label class="switch"><span class="small">Понимаю, что приложение — помощник, а не замена врачу</span><input type="checkbox" id="wAgree" ${s.agreed ? 'checked' : ''}></label>${nav()}`;
    } else if (wiz === 1) {
      h += `<p class="text-2">Нужно для нормы калорий и ориентиров по дозам. Можно пропустить и заполнить потом.</p>${profileForm(false)}${nav('Дальше', true)}`;
    } else if (wiz === 2) {
      h += `<p class="text-2">В разных школах диабета 1 ХЕ считают по-разному. Впиши, сколько граммов углеводов <b>ты</b> считаешь за одну хлебную единицу.</p>
        ${sNum('Граммов углеводов в 1 ХЕ', 'xeGrams', s.xeGrams, 'г', { min: 8, max: 20, ph: 'например, 12', hint: 'Чаще всего 10 или 12. Не знаешь — спроси врача или посмотри в выписке.' })}
        <span class="lbl">Как у тебя записан углеводный коэффициент</span>${seg([['xe', 'ЕД на 1 ХЕ'], ['g', '1 ЕД на X г']], s.carbMode, 'carbMode')}
        <p class="hint">Например, «1,5 ЕД на ХЕ» или «1 ЕД на 8 г углеводов».</p>${nav()}`;
    } else if (wiz === 3) {
      h += `<p class="text-2">Коэффициенты на разное время суток — из выписки или от эндокринолога. Без них калькулятор дозы будет закрыт.</p>
        <table class="coef-table"><tr><th></th><th>С, ч</th><th>${xe ? 'ЕД на ХЕ' : 'г на 1 ЕД'}</th><th>ФЧИ</th></tr>
        ${s.periods.map((p, i) => `<tr><td>${p.name}</td><td><input class="input" inputmode="numeric" data-s="periods.${i}.start" data-type="int" data-min="0" data-max="23" value="${p.start}"></td>
          <td><input class="input" inputmode="decimal" data-s="periods.${i}.ratio" data-type="num" data-min="${xe ? 0.1 : 2}" data-max="${xe ? 6 : 60}" value="${numVal(p.ratio)}" placeholder="—"></td>
          <td><input class="input" inputmode="decimal" data-s="periods.${i}.isf" data-type="num" data-min="0.3" data-max="12" value="${numVal(p.isf)}" placeholder="—"></td></tr>`).join('')}</table>
        <p class="hint">ФЧИ — на сколько ммоль/л снижает сахар 1 единица короткого инсулина.</p>
        ${sNum('Целевой сахар', 'target', s.target, 'ммоль/л', { min: 4, max: 9, hint: 'К нему ведёт коррекция. Часто 5,5–6,5.' })}${nav('Дальше', true)}`;
    } else if (wiz === 4) {
      const bolusPreset = C.BOLUS_INSULINS.find(b => b.name === s.bolusName) ? s.bolusName : '';
      h += `${field('Короткий инсулин', `<select class="input" data-onchange="bolusPreset"><option value="">выбери</option>${C.BOLUS_INSULINS.map(b => `<option ${bolusPreset === b.name ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}<option value="__other">Другой</option></select>`)}
        <span class="lbl">Шаг ручки короткого</span>${seg([[0.5, '0,5 ЕД'], [1, '1 ЕД']], s.step, 'step')}
        <hr>${field('Ночной инсулин', `<select class="input" data-s="basalName"><option value="">выбери</option>${C.BASAL_INSULINS.map(n => `<option ${s.basalName === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`)}
        <div class="grid2">${sNum('Обычная доза', 'basalDose', s.basalDose, 'ЕД', { min: 1, max: 120 })}${field('Время укола', `<input class="input" type="time" data-s="basalTime" value="${esc(s.basalTime)}">`)}</div>
        <p class="hint">Ночной колется один раз в сутки, вечером. Каждый вечер я подскажу дозу на эту ночь с учётом прошлых ночей.</p>${nav('Дальше', true)}`;
    } else {
      const ok = C.isConfigured();
      h += `${note(ok ? 'good' : 'info', ok ? 'Всё готово' : 'Почти готово', ok ? 'Калькулятор дозы настроен. Всё это можно поменять в настройках.' : 'Коэффициенты можно дописать позже в настройках — до этого калькулятор дозы будет закрыт.')}
        <p class="text-2">Чтобы данные не потерялись и появились напоминания в календаре телефона, включи онлайн-сохранение.</p>
        <div class="btn-row mt"><button class="btn" data-act="wizSync">${ic('cloud', 'sm')}Онлайн-сохранение</button><button class="btn primary" data-act="wizFinish">Начать</button></div>`;
    }
    return h;
  }
  function wizFlush() {
    let ok = true;
    $$('#sheetBody [data-s]').forEach(el => { if (el.type !== 'checkbox' && !onSetting(el, true)) ok = false; });
    return ok;
  }

  /* =========================================================
     Гипо: правило 15/15
     ========================================================= */
  let hypo = null;
  function openHypo(g = null) {
    if (!hypo || hypo.step === 'finished') hypo = { step: 'start', g: null, rounds: 0, reasons: new Set() };
    if (g != null) hypo.g = g;
    if (timer && timer.kind === 'hypo') hypo.step = 'wait';
    openSheet('Низкий сахар', hypoBody(), { sticky: true });
  }
  function hypoFoods() {
    const c = S().hypoCarbs;
    return `<ul><li>сок или сладкая газировка — <b>${c * 10} мл</b></li><li>таблетки глюкозы — <b>${Math.ceil(c / 4)} шт.</b> (по ~4 г, проверь упаковку)</li>
      <li>сахар — <b>${Math.round(c / 5)} кусочка</b> или чайных ложки</li><li>мёд — <b>${c <= 17 ? '1 ст. ложка' : '1,5 ст. ложки'}</b></li></ul>
      <p class="small muted">Шоколад и печенье не подходят: жир замедляет подъём сахара.</p>`;
  }
  function hypoBody() {
    const s = S(), h = hypo;
    const severe = acc({ title: 'Если сахар ниже 3,0, трудно глотать или спутанность', html: KNOWLEDGE.find(k => k.id === 'severe').html });
    if (h.step === 'start') {
      return `${note('danger', `Сахар ниже ${fmt(s.rangeLow)}: действуем спокойно`, 'Это бывает у всех, кто на инсулине. Ты знаешь, что делать.')}
        ${field('Сахар сейчас (если измерила)', numInput('hG', numVal(h.g), 'ммоль/л', '', true))}
        <h4>1. Съешь ${s.hypoCarbs} г быстрых углеводов</h4>${hypoFoods()}
        <h4>2. Подожди 15 минут и перемерь</h4><p class="small text-2">Ничего больше не ешь за это время, даже если очень хочется — голод в гипо обманчив.</p>
        <button class="btn primary block" data-act="hypoAte">Съела — запустить таймер</button><div class="mt">${severe}</div>`;
    }
    if (h.step === 'wait') {
      return `<div class="card center"><div class="small muted">Перемерь сахар через</div><div class="big-timer" data-timer>${timer ? mmss(timer.end - Date.now()) : '00:00'}</div>
        <p class="small muted mb0">Посиди, выпей воды. 15 минут кажутся долгими — это нормально.</p></div>
        <button class="btn block" data-act="hypoRecheck">Перемерить сейчас</button><div class="mt">${severe}</div>`;
    }
    if (h.step === 'recheck' || h.step === 'again') {
      return `${h.step === 'again' ? note('warn', `Сахар всё ещё ниже ${fmt(s.rangeLow)}`, `Съешь ещё ${s.hypoCarbs} г быстрых углеводов и подожди ещё 15 минут.`) + hypoFoods() + '<button class="btn primary block" data-act="hypoAte">Съела — ещё 15 минут</button><hr>' : ''}
        ${field('Какой сахар сейчас?', numInput('hG2', '', 'ммоль/л', '', true))}
        <button class="btn ${h.step === 'again' ? '' : 'primary'} block" data-act="hypoCheck">Записать замер</button><div class="mt">${severe}</div>`;
    }
    const reasons = ['Была нагрузка', 'Мало поела или пропустила еду', 'Многовато инсулина', 'Уколы подряд', 'Алкоголь', 'Жара, ванна', 'Не знаю'];
    return `<div class="card center"><div style="width:52px;height:52px;border-radius:16px;background:var(--good-soft);color:var(--good);display:grid;place-items:center;margin:0 auto 10px">${ic('check', 'lg')}</div><h3>Ты справилась</h3><p class="text-2 mb0">Сахар ${fmt(h.g)} — уже выше ${fmt(s.rangeLow)}.</p></div>
      ${note('info', 'Что дальше', 'Если до еды больше часа — съешь 1 ХЕ медленных углеводов (кусочек хлеба, яблоко). Не налегай на сладкое: сахар может подскочить. Перемерь ещё раз через час.')}
      <span class="lbl">Почему могла быть гипо? Так проще найти закономерность</span>
      <div class="chips">${reasons.map(l => `<button class="chip ${h.reasons.has(l) ? 'on' : ''}" data-act="hypoReason" data-v="${esc(l)}">${l}</button>`).join('')}</div>
      <button class="btn primary block mt" data-act="hypoDone">Готово</button>`;
  }

  /* =========================================================
     «Хочу сладкое»
     ========================================================= */
  const crave = { step: 'start' };
  function openCraving(step) {
    if (step) crave.step = step;
    if (timer && timer.kind === 'craving') crave.step = 'wait';
    openSheet('Хочу сладкое', cravingBody());
  }
  const option = (act, icon, title, sub, extra = '') => `<button class="option" data-act="${act}" ${extra}><span class="ic-wrap">${ic(icon)}</span><div class="grow"><b>${title}</b><span>${sub}</span></div></button>`;
  function cravingBody() {
    const cr = D.cravings, n = cr.resisted + cr.mindful;
    switch (crave.step) {
      case 'start':
        return `<p>Хотеть сладкого — нормально. Никакого чувства вины, просто выберем, как будет лучше.</p><p class="small text-2">Сначала вопрос: как ты себя чувствуешь?</p>
          ${option('craveStep', 'alert', 'Дрожь, пот, слабость, резкий голод', 'Это может быть гипо', 'data-v="maybeHypo"')}
          ${option('craveStep', 'heart', 'Всё нормально, просто хочется', 'Выберем, что делать', 'data-v="choose"')}`;
      case 'maybeHypo':
        return `${note('warn', 'Сначала измерь сахар', 'Резкая тяга к сладкому вместе с дрожью и слабостью — частый признак гипогликемии. Тогда сладкое — это лечение, и есть его нужно по правилу 15/15.')}
          <div class="btn-row"><button class="btn danger" data-act="hypo">Сахар низкий</button><button class="btn" data-act="craveStep" data-v="choose">Сахар нормальный</button></div>`;
      case 'choose':
        return `${n ? `<p class="small text-2">Ты уже справлялась с тягой ${n} ${plural(n, 'раз', 'раза', 'раз')}.</p>` : ''}
          ${option('craveWait', 'timer', 'Подождать 10 минут', 'Часто тяга проходит сама — подскажу, чем заняться')}
          ${option('craveStep', 'apple', 'Выбрать вариант полегче', 'Сладко, но мягко для сахара', 'data-v="swap"')}
          ${option('craveStep', 'calc', 'Съесть, но с умом', 'Посчитаем углеводы и дозу', 'data-v="mindful"')}`;
      case 'wait':
        return `<div class="card center"><div class="small muted">Осталось</div><div class="big-timer" data-timer>${timer ? mmss(timer.end - Date.now()) : '10:00'}</div></div>
          <h4>Чем заняться</h4><ul>${CRAVING_DISTRACT.map(d => `<li>${d}</li>`).join('')}</ul>
          <div class="btn-row mt"><button class="btn good" data-act="craveResisted">Тяга прошла</button><button class="btn" data-act="craveStep" data-v="after">Всё ещё хочу</button></div>`;
      case 'after':
        return `<p>Если тяга не прошла — это нормально. Тогда выберем вариант без вреда.</p>
          ${option('craveStep', 'apple', 'Вариант полегче', 'Ягоды, горький шоколад, йогурт', 'data-v="swap"')}
          ${option('craveStep', 'calc', 'Съесть, но с умом', 'Посчитаем углеводы и дозу', 'data-v="mindful"')}
          ${option('craveResisted', 'check', 'Тяга прошла', 'Отметить')}`;
      case 'swap':
        return `<p class="small text-2">Нажми на то, что выберешь:</p>${CRAVING_SWAPS.map((x, i) => option('craveSwap', 'apple', x.name, x.carbs ? `около ${x.carbs} г углеводов` : 'почти без углеводов', `data-i="${i}"`)).join('')}`;
      case 'mindful':
        return `<h4>Как съесть сладкое мягко для сахара</h4><ul>
          <li>Лучше <b>после основной еды</b>, а не вместо неё — белок и клетчатка замедлят подъём.</li>
          <li>Положи порцию на тарелку, а не ешь из пачки.</li>
          <li>Посчитай углеводы и <b>уколи за 15–20 минут</b>.</li>
          <li>Ешь медленно и с удовольствием — без чувства вины.</li></ul>
          <button class="btn primary block" data-act="craveMindful">Посчитать углеводы и дозу</button>`;
      default:
        return `<div class="card center"><h3>Ты молодец</h3><p class="text-2 mb0">${esc(SUPPORT_PHRASES[Math.floor(Math.random() * SUPPORT_PHRASES.length)])}</p></div>
          <button class="btn primary block" data-act="closeSheet">Закрыть</button>`;
    }
  }

  /* =========================================================
     Напоминания
     ========================================================= */
  const FIRED_KEY = 'saharok.fired';
  function checkReminders() {
    const now = new Date(), k = todayKey(), nowMin = now.getHours() * 60 + now.getMinutes();
    let fired;
    try { fired = JSON.parse(localStorage.getItem(FIRED_KEY) || '{}'); } catch (e) { fired = {}; }
    if (fired.day !== k) fired = { day: k, ids: [] };
    const done = D.routineDone[k] || [];
    let changed = false;
    for (const r of C.routineFor(k)) {
      const m = C.timeToMin(r.time);
      if (nowMin >= m && nowMin - m <= 20 && !fired.ids.includes(r.id) && !done.includes(r.id)) {
        notify(r.title, 'Отметь в СахарОК, когда сделаешь');
        toast(r.title, { ms: 5000 });
        fired.ids.push(r.id); changed = true;
      }
    }
    for (const p of D.plans) {
      if (p.done || p.date !== k || !p.time || fired.ids.includes('plan-' + p.id)) continue;
      const m = C.timeToMin(p.time);
      if (nowMin >= m - 10 && nowMin <= m + 5) { notify(p.title, `Дело на ${p.time}`); fired.ids.push('plan-' + p.id); changed = true; }
    }
    const s = S();
    const w = C.nightWindow();
    if ((s.basalDose || s.basalName) && !C.basalTonight().length && Date.now() >= w.due + 30 * MIN && Date.now() <= w.due + 4 * HOUR && !fired.ids.includes('basal')) {
      notify('Ночной инсулин', 'Этой ночью ещё не отмечен. Если уже уколола — отметь, чтобы не уколоть дважды.');
      fired.ids.push('basal'); changed = true;
    }
    if (changed) { try { localStorage.setItem(FIRED_KEY, JSON.stringify(fired)); } catch (e) { /* не страшно */ } }
  }

  /* =========================================================
     Действия
     ========================================================= */
  function flushInputs() { $$('[data-s]').forEach(el => { if (el.type !== 'checkbox' && el.value !== '') onSetting(el, true); }); }
  function refreshProfile() { if (sheetOpen()) wizRefresh(); else render(); }

  const ACT = {
    back: () => go(VIEWS[route].parent || 'home'),
    go: (el, ev) => { if (ev) ev.preventDefault(); closeSheetIfOpen(); go(el.dataset.to); },
    overlay: (el, ev) => { if (ev.target === el && !sheetSticky) closeSheet(); },
    closeSheet: () => closeSheet(),

    quickG: () => {
      const inp = $('#quickG'), g = parseNum(inp.value);
      if (g == null) return inp.focus();
      if (g < 1 || g > 35) return toast('Сахар — от 1 до 35 ммоль/л');
      addEntryWithUndo({ id: C.uid(), t: Date.now(), glucose: g }, true, `Записано: ${fmt(g)}`);
      render();
      if (g < S().rangeLow) openHypo(g);
      else if (g >= S().ketoneLevel) toast('Сахар высокий — проверь кетоны и выпей воды', { ms: 5000 });
    },
    add: el => openEntry(el.dataset.kind || 'glucose', null, route === 'diary' && diaryDay !== C.startOfDay(Date.now()) ? { t: diaryDay + 12 * HOUR } : {}),
    editEntry: el => openEntry('glucose', el.dataset.id),
    entryType: el => {
      if (el.dataset.v === entryCtx.type) return;
      Object.assign(entryCtx.v, readEntryForm());
      entryCtx.type = el.dataset.v;
      if (!entryCtx.id) setSheetTitle(ENTRY_TITLES[entryCtx.type]);
      setSheetBody(entryBody());
    },
    entrySave: saveEntry,
    entryDel: () => {
      if (!confirm('Удалить эту запись?')) return;
      const e = D.entries.find(x => x.id === entryCtx.id);
      C.del('entries', entryCtx.id);
      closeSheet(); render();
      toast('Удалено', { undo: () => { C.put('entries', e); render(); } });
    },
    entryTag: el => {
      const id = el.dataset.id;
      entryCtx.tags.has(id) ? entryCtx.tags.delete(id) : entryCtx.tags.add(id);
      el.classList.toggle('on');
    },
    entryUnit: el => {
      const u = el.dataset.v;
      if (u === entryCtx.unit) return;
      const inp = $('#eC'), v = parseNum(inp.value);
      if (v != null) inp.value = numVal(Math.round((u === 'xe' ? v / xg() : v * xg()) * 10) / 10);
      entryCtx.unit = u;
      $('#eCU').textContent = u === 'xe' ? 'ХЕ' : 'г';
      $$('[data-act="entryUnit"]').forEach(b => b.classList.toggle('on', b.dataset.v === u));
    },
    basalDone: el => {
      const dose = parseNum(el.dataset.dose);
      if (!(dose > 0)) return openEntry('basal');
      if (C.basalTonight().length && !confirm('Ночной инсулин этой ночью уже отмечен. Это точно ещё один укол?')) return;
      const site = suggestSite('basal');
      const e = { id: C.uid(), t: Date.now(), basal: dose };
      if (site) e.site = site.id;
      addEntryWithUndo(e, true, `Ночной: ${fmtU(dose)} ЕД`);
      render();
    },
    basalMakeUsual: el => {
      const d = parseNum(el.dataset.dose);
      if (!confirm(`Сделать ${fmtU(d)} ЕД обычной ночной дозой? Лучше, если это согласовано с врачом.`)) return;
      S().basalDose = d; touch(); render(); toast('Обычная доза изменена');
    },

    diaryDay: el => { diaryDay = +el.dataset.t; render(); },
    mood: el => { D.moods[todayKey()] = +el.dataset.v; save(); render(); },
    cycleStart: () => {
      const k = todayKey();
      if (!D.cycleStarts.includes(k)) D.cycleStarts.push(k);
      D.cycleStarts.sort(); save(); render();
      toast('Отмечено. В ближайшие дни следи за гипо', { undo: () => { D.cycleStarts = D.cycleStarts.filter(x => x !== k); save(); render(); } });
    },
    cycleUndo: (el, ev) => { if (ev) ev.preventDefault(); D.cycleStarts.pop(); save(); render(); },
    routineToggle: el => {
      const k = todayKey(), id = el.dataset.id;
      const arr = D.routineDone[k] || (D.routineDone[k] = []);
      const i = arr.indexOf(id);
      i >= 0 ? arr.splice(i, 1) : arr.push(id);
      save(); render();
    },
    routineExpand: () => { routineExpanded = !routineExpanded; render(); },

    /* расчёт дозы */
    calcUnit: el => {
      const u = el.dataset.v;
      if (u === calcUnit()) return;
      const v = parseNum(calc.manual);
      if (v != null) calc.manual = numVal(Math.round((u === 'xe' ? v / xg() : v * xg()) * 10) / 10);
      calc.unit = u; render();
    },
    calcEx: el => { calc.exercise = +el.dataset.v; calc.saved = null; render(); },
    calcFlag: el => {
      const f = el.dataset.f;
      const cur = calcFlags().flags[f];
      calc.flags[f] = !cur;
      calc.touched[f] = true;
      calc.saved = null; render();
    },
    calcItemDel: el => { calc.items.splice(+el.dataset.i, 1); render(); },
    calcClearFood: () => { calc.items = []; calc.manual = ''; calc.q = ''; render(); },
    calcAddFood: el => {
      const f = allFoods().find(x => x.id === el.dataset.id);
      if (!f) return;
      addFoodToCalc(f, f.portionG || 100);
      calc.q = '';
      const q = $('#calcQ'); if (q) q.value = '';
      $('#calcItems').innerHTML = calcItemsHtml();
      renderCalcSearch(); renderCalcResult();
      toast(`${f.name}: ${f.portionG || 100} ${f.liquid ? 'мл' : 'г'} — вес можно поправить`);
    },
    calcSave,
    prebolus: el => { startTimer(+el.dataset.min, 'Можно есть', 'prebolus'); toast(`Таймер на ${el.dataset.min} минут запущен`); },
    useDish: el => {
      const d = D.dishes.find(x => x.id === el.dataset.id);
      if (!d) return;
      d.items.forEach(it => calc.items.push(Object.assign({}, it)));
      calc.saved = null; render();
    },
    saveDish: () => {
      const name = prompt('Как назвать блюдо?', calc.items.map(i => i.name).slice(0, 2).join(' + '));
      if (!name) return;
      C.put('dishes', { id: C.uid(), name: name.trim(), items: calc.items.map(it => Object.assign({}, it)) });
      toast('Блюдо сохранено — оно будет в быстрых кнопках');
    },
    applyAdjust: (el, ev) => {
      if (ev) ev.preventDefault();
      S().adjust[el.dataset.id] = +el.dataset.pct; touch(); render();
      toast('Поправка сохранена');
    },

    /* продукты */
    foodsCat: el => { foodsCat = el.dataset.v; render(); },
    foodOpen: el => openFood(el.dataset.id),
    foodToCalc: () => {
      const g = parseNum($('#foodG').value) || foodCtx.portionG || 100;
      addFoodToCalc(foodCtx, g); closeSheet(); go('calc');
    },
    foodFav: el => {
      const i = D.favFoods.indexOf(foodCtx.id);
      i >= 0 ? D.favFoods.splice(i, 1) : D.favFoods.push(foodCtx.id);
      save(); el.textContent = i >= 0 ? 'В избранное' : 'В избранном'; renderFoodList();
    },
    foodNew: () => openFoodEditor(),
    foodEdit: () => openFoodEditor(D.customFoods.find(f => f.id === foodCtx.id)),
    foodDel: () => { if (!confirm(`Удалить «${foodCtx.name}»?`)) return; C.del('customFoods', foodCtx.id); closeSheet(); render(); },
    segPick: el => { $$('button', el.parentElement).forEach(b => b.classList.toggle('on', b === el)); },
    foodSave: () => {
      const name = $('#fName').value.trim(), carbs = parseNum($('#fCarbs').value);
      if (!name) return toast('Впиши название');
      if (carbs == null || carbs < 0 || carbs > 100) return toast('Углеводы на 100 г — от 0 до 100');
      const on = $('#fGi .on');
      const f = {
        id: foodCtx && D.customFoods.some(x => x.id === foodCtx.id) ? foodCtx.id : 'my:' + C.uid(),
        name, carbs, cat: 'my', gi: on ? on.dataset.v : 'M',
        kcal: parseNum($('#fKcal').value), protein: parseNum($('#fProt').value), fat: parseNum($('#fFat').value),
        portion: $('#fPortion').value.trim(), portionG: parseNum($('#fPortionG').value), liquid: $('#fLiquid').checked,
      };
      C.put('customFoods', f);
      closeSheet(); toast('Продукт сохранён');
      if (route === 'calc') calc.q = f.name;
      render();
    },
    dishOpen: el => {
      const d = D.dishes.find(x => x.id === el.dataset.id);
      if (!d) return;
      openSheet(d.name, `<div class="list">${d.items.map(it => `<div class="row-item"><div class="grow"><div class="t">${esc(it.name)}</div><div class="s">${esc(it.g)} ${it.liquid ? 'мл' : 'г'} · ${fmt(it.carbs * (parseNum(it.g) || 0) / 100, 1)} г угл.</div></div></div>`).join('')}</div>
        <div class="btn-row mt"><button class="btn danger" data-act="dishDel" data-id="${d.id}">Удалить</button><button class="btn primary" data-act="dishUse" data-id="${d.id}">В расчёт дозы</button></div>`);
    },
    dishDel: el => { if (!confirm('Удалить блюдо?')) return; C.del('dishes', el.dataset.id); closeSheet(); render(); },
    dishUse: el => { const d = D.dishes.find(x => x.id === el.dataset.id); d.items.forEach(it => calc.items.push(Object.assign({}, it))); calc.saved = null; closeSheet(); go('calc'); },

    /* дела */
    plansTab: el => { plansTab = el.dataset.v || el.dataset.tab; if (route !== 'plans') go('plans'); else render(); },
    planFilter: el => { planFilter = el.dataset.v; render(); },
    planNew: () => openPlan(),
    planEdit: el => openPlan(el.dataset.id),
    planToggle: el => {
      const p = D.plans.find(x => x.id === el.dataset.id);
      if (!p) return;
      const upd = Object.assign({}, p, { done: !p.done, doneAt: p.done ? null : Date.now() });
      C.put('plans', upd);
      render();
      if (upd.done) toast('Готово', { undo: () => { C.put('plans', Object.assign({}, upd, { done: false, doneAt: null })); render(); } });
    },
    planDate: el => {
      planCtx.date = el.dataset.v;
      $('#pDate').value = planCtx.date;
      $('#pDates').innerHTML = planDateChips();
    },
    planCat: el => { planCtx.cat = el.dataset.v; $$('#pCats .chip').forEach(b => b.classList.toggle('on', b === el)); },
    planSave: () => {
      const title = $('#pTitle').value.trim();
      if (!title) { toast('Напиши, что сделать'); return $('#pTitle').focus(); }
      const old = planCtx.id ? D.plans.find(x => x.id === planCtx.id) : null;
      C.put('plans', Object.assign({}, old || { id: C.uid(), done: false, created: Date.now() }, {
        title, date: $('#pDate').value || '', time: $('#pTime').value || '', cat: planCtx.cat,
        important: $('#pImp').checked, note: $('#pNote').value.trim(),
      }));
      closeSheet(); render();
      toast(old ? 'Сохранено' : 'Дело добавлено');
    },
    planDel: () => {
      if (!confirm('Удалить дело?')) return;
      const p = D.plans.find(x => x.id === planCtx.id);
      C.del('plans', planCtx.id); closeSheet(); render();
      toast('Удалено', { undo: () => { C.put('plans', p); render(); } });
    },
    planIcs: () => downloadFile('delo.ics', C.toICS(D, { plans: [planCtx.id] }), 'text/calendar'),
    plansClearDone: () => {
      if (!confirm('Удалить все выполненные дела?')) return;
      D.plans.filter(p => p.done).forEach(p => C.del('plans', p.id));
      render();
    },

    routineEdit: el => openRoutine(el.dataset.id),
    routineNew: () => openRoutine(),
    chipToggle: el => el.classList.toggle('on'),
    routineSave: el => {
      const title = $('#rTitle').value.trim(), time = $('#rTime').value;
      if (!title || !time) return toast('Заполни время и название');
      const days = $$('#rDays .chip.on').map(b => +b.dataset.v);
      if (!days.length) return toast('Выбери хотя бы один день');
      const old = el.dataset.id ? D.routine.find(r => r.id === el.dataset.id) : null;
      C.put('routine', Object.assign({}, old || { id: C.uid() }, { time, title, days, on: $('#rOn').checked }));
      closeSheet(); render();
    },
    routineDel: el => { if (!confirm('Удалить пункт режима?')) return; C.del('routine', el.dataset.id); closeSheet(); render(); },
    routineClear: () => {
      if (!confirm('Удалить все пункты режима дня?')) return;
      D.routine.slice().forEach(r => C.del('routine', r.id));
      render();
    },
    routineExample: () => {
      const missing = C.exampleRoutine().filter(r => !D.routine.some(x => x.id === r.id));
      if (!missing.length) return toast('Пример уже загружен');
      if (D.routine.length && !confirm('Добавить пункты из примера к твоему режиму?')) return;
      missing.forEach(r => C.put('routine', r));
      render();
    },
    icsAll: () => downloadFile('saharok-kalendar.ics', C.toICS(D), 'text/calendar').then(ok => ok && toast('Открой файл — телефон предложит добавить события в календарь', { ms: 5000 })),
    notifOn: async () => {
      if (!('Notification' in window)) return toast('Этот браузер не поддерживает уведомления');
      const r = await Notification.requestPermission();
      toast(r === 'granted' ? 'Уведомления включены' : 'Уведомления не разрешены');
      render();
    },

    supplyEdit: el => openSupply(el.dataset.id),
    supplyNew: () => openSupply(),
    supplyTemplate: el => {
      const t = C.SUPPLY_TEMPLATES.find(x => x.id === el.dataset.id);
      C.put('supplies', C.supplyFromTemplate(t));
      closeSheet(); render(); openSupply(t.id);
    },
    supplyAdd: el => {
      const inp = $('#sQty');
      inp.value = numVal(Math.max(0, (parseNum(inp.value) || 0) + Number(el.dataset.n)));
    },
    supplySave: el => {
      const name = $('#sName').value.trim();
      if (!name) return toast('Впиши название');
      const per = parseNum($('#sPer').value), warn = parseInt($('#sWarn').value, 10);
      const old = el.dataset.id ? D.supplies.find(x => x.id === el.dataset.id) : null;
      C.put('supplies', Object.assign({}, old || { id: C.uid() }, {
        name, qty: parseNum($('#sQty').value), unit: $('#sUnit').value.trim() || 'шт', perDay: per > 0 ? per : 1,
        pack: parseNum($('#sPack').value), warnDays: warn > 0 ? warn : 14, auto: $('#sAuto').value,
      }));
      closeSheet(); render();
    },
    supplyDel: el => { if (!confirm('Убрать из запасов?')) return; C.del('supplies', el.dataset.id); closeSheet(); render(); },
    suppliesClear: () => {
      if (!confirm('Очистить список запасов?')) return;
      D.supplies.slice().forEach(x => C.del('supplies', x.id));
      render();
    },

    /* анализ и отчёт */
    anDays: el => { anDays = +el.dataset.v; render(); },
    anDayPrev: () => { anDay = C.startOfDay(anDay - DAY + 2 * HOUR); render(); },
    anDayNext: () => { anDay = C.startOfDay(anDay + DAY + 2 * HOUR); render(); },
    repDays: el => { repDays = +el.dataset.v; render(); },
    print: () => window.print(),

    siteLog: el => {
      const x = C.SITES.find(s => s.id === el.dataset.id);
      openSheet(x.label, `<p class="text-2">Отметить укол сюда сейчас?</p><div class="btn-row"><button class="btn" data-act="siteLogKind" data-id="${x.id}" data-kind="bolus">Короткий</button><button class="btn" data-act="siteLogKind" data-id="${x.id}" data-kind="basal">Ночной</button></div>`);
    },
    siteLogKind: el => { logSite(el.dataset.id, el.dataset.kind); closeSheet(); render(); toast('Место отмечено'); },

    /* питание */
    nutriEdit: () => { nutriEdit = true; render(); },
    nutriDone: () => {
      $$('[data-s]').forEach(el => onSetting(el, true));
      if (!C.nutritionNorm()) return toast('Заполни возраст, рост и вес');
      nutriEdit = false; render(); window.scrollTo(0, 0);
    },
    setSex: el => { flushInputs(); S().sex = el.dataset.v; touch(); refreshProfile(); },
    setActivity: el => { flushInputs(); S().activity = el.dataset.v; touch(); refreshProfile(); },
    setGoal: el => { flushInputs(); S().goal = el.dataset.v; touch(); refreshProfile(); },

    /* настройки */
    setTheme: el => { S().theme = el.dataset.v; touch(); applyTheme(); render(); },
    carbMode: el => {
      const s = S(), m = el.dataset.v;
      if (m === s.carbMode) return;
      flushInputs();
      if (s.periods.some(p => p.ratio > 0) && !(s.xeGrams > 0)) return toast('Сначала впиши, сколько граммов в 1 ХЕ');
      s.periods.forEach(p => { if (p.ratio > 0) p.ratio = Math.round(s.xeGrams / p.ratio * 100) / 100; });
      s.carbMode = m; touch();
      if (sheetOpen()) wizRefresh(); else render();
      if (s.periods.some(p => p.ratio > 0)) toast('Коэффициенты пересчитаны — проверь их');
    },
    step: el => { flushInputs(); S().step = +el.dataset.v; touch(); if (sheetOpen()) wizRefresh(); else render(); },
    basalStep: el => { S().basalStep = +el.dataset.v; touch(); render(); },
    exportJson: () => {
      downloadFile(`saharok-kopiya-${todayKey()}.json`, JSON.stringify(D, null, 1), 'application/json').then(ok => {
        if (!ok) return;
        S().lastBackup = Date.now(); touch(); render();
        toast('Копия сохранена. Отправь её себе в облако или мессенджер', { ms: 5000 });
      });
    },
    exportCsv: () => downloadFile(`saharok-dnevnik-${todayKey()}.csv`, C.toCSV(), 'text/csv'),
    importJson: () => $('#importFile').click(),
    resetAll: () => {
      if (!confirm('Удалить ВСЕ данные на этом устройстве: дневник, настройки, планы? Это нельзя отменить.')) return;
      if (!confirm('Точно? Лучше сначала сохранить копию.')) return;
      Sync.signOut();
      D = C.reset(); applyTheme(); go('home'); openWizard(0);
    },

    /* онлайн-сохранение */
    syncSaveCfg: () => {
      const u = $('#sbUrl').value.trim(), k = $('#sbKey').value.trim();
      if (!/^https:\/\/.+/.test(u)) return toast('Адрес должен начинаться с https://');
      if (k.length < 20) return toast('Ключ слишком короткий — скопируй его целиком');
      Sync.setConfig(u, k); updateSyncDot(); render();
    },
    syncResetCfg: () => { Sync.setConfig('', ''); updateSyncDot(); render(); },
    syncSignIn: async el => {
      const email = $('#sbEmail').value.trim(), pass = $('#sbPass').value;
      if (!email || !pass) return toast('Впиши почту и пароль');
      el.disabled = true;
      try { await Sync.signIn(email, pass); toast(Sync.status === 'ok' ? 'Вход выполнен, данные синхронизированы' : Sync.error || 'Вход выполнен'); }
      catch (e) { toast(e.message, { ms: 5000 }); }
      D = C.get(); updateSyncDot(); render();
    },
    syncSignUp: async el => {
      const email = $('#sbEmail').value.trim(), pass = $('#sbPass').value;
      if (!email || pass.length < 6) return toast('Почта и пароль не короче 6 символов');
      el.disabled = true;
      try {
        const r = await Sync.signUp(email, pass);
        toast(r === 'ok' ? 'Аккаунт создан, данные сохранены в облаке' : 'Открой письмо от Supabase, подтверди почту и нажми «Войти»', { ms: 6000 });
      } catch (e) { toast(e.message, { ms: 5000 }); }
      D = C.get(); updateSyncDot(); render();
    },
    syncNow: async () => { await Sync.syncNow(); D = C.get(); render(); },
    syncOut: () => {
      if (!confirm('Выйти из аккаунта? Данные останутся на этом устройстве, но перестанут сохраняться в облако.')) return;
      Sync.signOut(); updateSyncDot(); render();
    },
    copyCal: async () => {
      const u = Sync.calendarUrl();
      try { await navigator.clipboard.writeText(u); toast('Ссылка скопирована'); }
      catch (e) { prompt('Скопируй ссылку:', u); }
    },

    /* мастер */
    wizard: () => openWizard(0),
    wizardCoef: () => openWizard(2),
    wizardStep: el => openWizard(+el.dataset.step),
    wizBack: () => { wizFlush(); wiz = Math.max(0, wiz - 1); wizRefresh(); },
    wizSkip: () => { wiz++; wizRefresh(); },
    wizNext: () => {
      if (!wizFlush()) return toast('Проверь значения — некоторые вне допустимого диапазона');
      const s = S();
      if (wiz === 0) {
        if (!$('#wAgree').checked) return toast('Отметь, что понимаешь: приложение не заменяет врача');
        s.agreed = true; touch();
      }
      if (wiz === 2 && !(s.xeGrams > 0)) return toast('Впиши, сколько граммов углеводов в 1 ХЕ');
      wiz++; wizRefresh();
    },
    wizSync: () => { S().onboarded = true; touch(); closeSheet(); go('sync'); },
    wizFinish: () => {
      S().onboarded = true; touch(); closeSheet();
      try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* необязательно */ }
      go('home');
    },

    /* гипо */
    hypo: () => { closeSheetIfOpen(); openHypo(); },
    hypoAte: () => {
      const s = S(), inp = $('#hG');
      const g = inp ? parseNum(inp.value) : null;
      if (g != null && (g < 1 || g > 35)) return toast('Проверь сахар');
      if (g != null && g >= s.rangeLow + 1 && !confirm(`Сахар ${fmt(g)} — это не гипо. Если есть симптомы, вымой руки и перемерь. Всё равно продолжить?`)) return;
      const e = { id: C.uid(), t: Date.now(), carbs: s.hypoCarbs, tags: ['hypo'], note: 'Купирование гипо (правило 15/15)' };
      if (g != null) e.glucose = g;
      C.put('entries', e);
      if (g != null) { C.consumeSupplies(e); hypo.g = g; }
      hypo.rounds++;
      hypo.step = 'wait';
      startTimer(15, 'Перемерь сахар', 'hypo');
      setSheetBody(hypoBody());
      if (route === 'home' || route === 'diary') render();
    },
    hypoRecheck: () => { stopTimer(); hypo.step = 'recheck'; setSheetBody(hypoBody()); setTimeout(() => { const i = $('#hG2'); i && i.focus(); }, 60); },
    hypoCheck: () => {
      const s = S(), g = parseNum($('#hG2').value);
      if (g == null || g < 1 || g > 35) return toast('Впиши сахар');
      const e = { id: C.uid(), t: Date.now(), glucose: g };
      if (g < s.rangeLow) e.tags = ['hypo'];
      C.put('entries', e); C.consumeSupplies(e);
      hypo.g = g;
      if (timer && timer.kind === 'hypo') stopTimer();
      if (g < s.rangeLow) hypo.step = 'again';
      else { hypo.step = 'ok'; D.hypoHandled = (D.hypoHandled || 0) + 1; save(); }
      setSheetBody(hypoBody());
      if (route === 'home' || route === 'diary') render();
    },
    hypoReason: el => { const v = el.dataset.v; hypo.reasons.has(v) ? hypo.reasons.delete(v) : hypo.reasons.add(v); el.classList.toggle('on'); },
    hypoDone: () => {
      if (hypo.reasons.size) {
        const e = [...D.entries].reverse().find(x => (x.tags || []).includes('hypo') && x.carbs > 0);
        if (e) C.put('entries', Object.assign({}, e, { note: `${e.note ? e.note + '. ' : ''}Возможная причина: ${[...hypo.reasons].join(', ').toLowerCase()}` }));
      }
      hypo.step = 'finished'; closeSheet(); render();
    },

    /* сладкое */
    craving: () => { crave.step = 'start'; openCraving(); },
    craveStep: el => { crave.step = el.dataset.v; setSheetBody(cravingBody()); },
    craveWait: () => { startTimer(10, 'Прошло 10 минут', 'craving'); crave.step = 'wait'; setSheetBody(cravingBody()); },
    craveResisted: () => {
      if (timer && timer.kind === 'craving') stopTimer();
      D.cravings.resisted++; save(); crave.step = 'done'; setSheetBody(cravingBody());
    },
    craveSwap: el => {
      const x = CRAVING_SWAPS[+el.dataset.i];
      if (timer && timer.kind === 'craving') stopTimer();
      D.cravings.mindful++; save();
      crave.step = 'done'; setSheetBody(cravingBody());
      if (x.carbs >= 5) toast(`Около ${x.carbs} г углеводов — учти в дозе`, { ms: 4000 });
    },
    craveMindful: () => {
      if (timer && timer.kind === 'craving') stopTimer();
      D.cravings.mindful++; save(); closeSheet();
      calc.q = 'шоколад'; go('calc');
      setTimeout(() => { const q = $('#calcQ'); if (q) { q.focus(); q.select(); } }, 150);
    },
  };

  const CHANGE = {
    bolusPreset: el => {
      const s = S(), v = el.value;
      const b = C.BOLUS_INSULINS.find(x => x.name === v);
      if (b) Object.assign(s, { bolusName: b.name, dia: b.dia, peak: b.peak });
      else if (v === '__other') s.bolusName = s.bolusName && !C.BOLUS_INSULINS.some(x => x.name === s.bolusName) ? s.bolusName : 'Другой';
      else s.bolusName = '';
      touch();
      if (!sheetOpen()) render();
    },
    loveNotes: el => { S().loveNotes = el.value.split('\n').map(x => x.trim()).filter(Boolean); touch(); toast('Записки сохранены'); },
    diaryPick: el => { if (el.value) { diaryDay = C.keyToTime(el.value); render(); } },
    planDateInput: el => { planCtx.date = el.value; $('#pDates').innerHTML = planDateChips(); },
  };

  /* =========================================================
     События
     ========================================================= */
  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = ACT[el.dataset.act];
    if (!fn) return;
    if (el.tagName === 'A') ev.preventDefault();
    fn(el, ev);
  });

  document.addEventListener('input', ev => {
    const el = ev.target;
    if (el.dataset.calc) {
      calc[el.dataset.calc] = el.value; calc.saved = null;
      if (el.dataset.calc === 'g') { const tr = C.trendFor(parseNum(el.value)); const h = $('#calcTrend'); if (h) h.textContent = tr ? `${tr.mins} мин назад было ${fmt(tr.prev.glucose)}` : ''; }
      renderCalcResult();
    } else if (el.dataset.calcItem !== undefined) { calc.items[+el.dataset.calcItem].g = el.value; renderCalcResult(); }
    else if (el.dataset.calcSearch !== undefined) { calc.q = el.value; renderCalcSearch(); }
    else if (el.dataset.search === 'foods') { foodsQ = el.value; renderFoodList(); }
    else if (el.dataset.live === 'foodCalc') foodLive();
  });

  document.addEventListener('change', ev => {
    const el = ev.target;
    if (el.id === 'importFile' && el.files && el.files[0]) {
      const r = new FileReader();
      r.onload = () => {
        try {
          const obj = JSON.parse(r.result);
          if (!confirm(`Восстановить данные из файла? Текущие данные на этом устройстве (${D.entries.length} записей) будут заменены.`)) return;
          D = C.replaceAll(obj); C.touchSettings(); applyTheme(); render(); toast('Данные восстановлены');
        } catch (e) { toast('Не получилось прочитать файл: ' + e.message, { ms: 4000 }); }
      };
      r.readAsText(el.files[0]);
      el.value = '';
      return;
    }
    if (el.dataset.s) {
      if (el.dataset.s === 'theme') applyTheme();
      onSetting(el);
    }
    if (el.dataset.onchange && CHANGE[el.dataset.onchange]) CHANGE[el.dataset.onchange](el);
  });

  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') { if (sheetOpen() && !sheetSticky) closeSheet(); return; }
    if (ev.key !== 'Enter') return;
    if (ev.target.id === 'quickG') { ev.preventDefault(); ACT.quickG(); }
    if (ev.target.id === 'pTitle') { ev.preventDefault(); ACT.planSave(); }
  });

  $('#timerPill').addEventListener('click', () => {
    if (!timer) return;
    if (timer.kind === 'hypo') openHypo();
    else if (timer.kind === 'craving') openCraving();
    else if (confirm('Остановить таймер?')) stopTimer();
  });

  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { const v = VIEWS[route]; v.after && v.after(); }, 200); });
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkReminders(); if (!sheetOpen() && !typing()) render(); } });
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { const v = VIEWS[route]; v.after && v.after(); }); } catch (e) { /* старый браузер */ }

  C.onSave(() => Sync.schedule());
  Sync.onStatus(() => { updateSyncDot(); if (route === 'sync' && !typing() && !sheetOpen()) render(); });
  Sync.onData(() => { D = C.get(); applyTheme(); if (!sheetOpen() && !typing()) render(); });

  /* =========================================================
     Старт
     ========================================================= */
  renderChrome();
  applyTheme();
  render();
  updateSyncDot();
  setInterval(tick, 1000);
  tick();
  setInterval(checkReminders, 30000);
  setTimeout(checkReminders, 3000);
  Sync.start();
  if (!S().onboarded) openWizard(0);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW:', e));
  }
})();
