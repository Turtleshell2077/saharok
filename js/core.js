/* СахарОК — данные, расчёт дозы, обучение на истории, питание и аналитика.
 * Здесь нет работы с интерфейсом: только данные и формулы, поэтому файл
 * проверяется отдельно (node tests/core.test.js). */
'use strict';

const Core = (() => {
  const KEY = 'saharok.v1';
  const MIN = 60000, HOUR = 3600000, DAY = 86400000;

  const TAGS = [
    { id: 'sport',   label: 'Нагрузка' },
    { id: 'stress',  label: 'Стресс' },
    { id: 'sick',    label: 'Болезнь' },
    { id: 'pms',     label: 'ПМС' },
    { id: 'menses',  label: 'Месячные' },
    { id: 'nosleep', label: 'Недосып' },
    { id: 'alcohol', label: 'Алкоголь' },
    { id: 'fatty',   label: 'Жирная еда' },
    { id: 'heat',    label: 'Жара' },
    { id: 'hypo',    label: 'Гипо' },
  ];

  // Личные поправки к дозе (в %). Значения задаёт она сама, приложение подсказывает по данным.
  const ADJUST = [
    { id: 'sick',       tag: 'sick',   label: 'Болезнь, температура',     hint: 'обычно +10…+20%' },
    { id: 'pms',        tag: 'pms',    label: 'ПМС (неделя до месячных)', hint: 'обычно +10…+20%' },
    { id: 'menses',     tag: 'menses', label: 'Первые дни месячных',      hint: 'у многих −10…0%' },
    { id: 'stress',     tag: 'stress', label: 'Сильный стресс',           hint: 'обычно +5…+10%' },
    { id: 'heat',       tag: 'heat',   label: 'Жара, баня, горячая ванна', hint: 'обычно −10…−20%' },
    { id: 'afterSport', tag: 'sport',  label: 'Была нагрузка за сутки',   hint: 'обычно −10…−20%' },
  ];

  const BOLUS_INSULINS = [
    { name: 'НовоРапид',  dia: 4,   peak: 75 },
    { name: 'Хумалог',    dia: 4,   peak: 75 },
    { name: 'Апидра',     dia: 4,   peak: 65 },
    { name: 'Фиасп',      dia: 3.5, peak: 55 },
    { name: 'Лирумджев',  dia: 3.5, peak: 55 },
    { name: 'Актрапид / Ринсулин Р', dia: 6, peak: 150 },
  ];
  const BASAL_INSULINS = ['Тресиба', 'Туджео', 'Лантус', 'Левемир', 'Базаглар', 'Протафан'];

  const SITES = [
    { id: 'belly-l', label: 'Живот слева',    area: 'belly' },
    { id: 'belly-r', label: 'Живот справа',   area: 'belly' },
    { id: 'arm-l',   label: 'Плечо левое',    area: 'arm' },
    { id: 'arm-r',   label: 'Плечо правое',   area: 'arm' },
    { id: 'thigh-l', label: 'Бедро левое',    area: 'thigh' },
    { id: 'thigh-r', label: 'Бедро правое',   area: 'thigh' },
    { id: 'butt-l',  label: 'Ягодица левая',  area: 'butt' },
    { id: 'butt-r',  label: 'Ягодица правая', area: 'butt' },
  ];

  const ACTIVITY_LEVELS = [
    { id: 'min',   label: 'Почти без движения', hint: 'учёба или работа сидя, без тренировок', k: 1.2 },
    { id: 'light', label: 'Лёгкая',             hint: 'прогулки, 1–3 тренировки в неделю', k: 1.375 },
    { id: 'mid',   label: 'Средняя',            hint: '3–5 тренировок в неделю', k: 1.55 },
    { id: 'high',  label: 'Высокая',            hint: '6–7 тренировок в неделю', k: 1.725 },
    { id: 'max',   label: 'Очень высокая',      hint: 'спорт каждый день и физическая работа', k: 1.9 },
  ];
  const GOALS = [
    { id: 'keep', label: 'Сохранить вес', k: 1 },
    { id: 'lose', label: 'Немного снизить', k: 0.85 },
    { id: 'gain', label: 'Набрать', k: 1.1 },
  ];
  const MEAL_SPLIT = [['Завтрак', 0.25], ['Перекус', 0.10], ['Обед', 0.30], ['Перекус', 0.10], ['Ужин', 0.25]];

  const EXAMPLE_ROUTINE = [
    ['r-wake', '07:30', 'Подъём, сахар натощак'],
    ['r-breakfast', '08:00', 'Завтрак: укол за 10–15 минут до еды'],
    ['r-lunch', '13:00', 'Обед, замер перед едой'],
    ['r-snack', '16:00', 'Перекус или контрольный замер'],
    ['r-dinner', '19:00', 'Ужин, замер перед едой'],
    ['r-night', '22:00', 'Сахар перед сном и ночной инсулин'],
    ['r-sleep', '23:30', 'Отбой'],
  ];
  const SUPPLY_TEMPLATES = [
    { id: 's-strips',  name: 'Тест-полоски',                 unit: 'шт', perDay: 5,    pack: 50,  auto: 'glucose' },
    { id: 's-needles', name: 'Иглы для шприц-ручек',         unit: 'шт', perDay: 5,    pack: 100, auto: 'injection' },
    { id: 's-lancets', name: 'Ланцеты',                      unit: 'шт', perDay: 1,    pack: 100, auto: '' },
    { id: 's-bolus',   name: 'Картриджи короткого инсулина', unit: 'шт', perDay: 0.07, pack: 5,   auto: '' },
    { id: 's-basal',   name: 'Ручки ночного инсулина',       unit: 'шт', perDay: 0.04, pack: 5,   auto: '' },
    { id: 's-sensor',  name: 'Сенсоры',                      unit: 'шт', perDay: 1 / 14, pack: 2, auto: '' },
  ];

  /* ---------- утилиты ---------- */
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN;
  const median = a => { if (!a.length) return NaN; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  const pad = n => String(n).padStart(2, '0');
  const parseNum = v => {
    if (v == null) return null;
    const s = String(v).trim().replace(',', '.');
    if (s === '') return null;
    const n = parseFloat(s);
    return isFinite(n) ? n : null;
  };
  const fmt = (n, d = 1) => (n == null || !isFinite(n)) ? '—' : Number(n).toFixed(d).replace('.', ',').replace(/^-/, '−');
  const fmtU = n => fmt(n, Math.abs(n - Math.round(n)) < 1e-9 ? 0 : (Math.abs(n * 2 - Math.round(n * 2)) < 1e-9 ? 1 : 2));
  const fmtS = (n, d = 1) => (n > 0 ? '+' : '') + fmt(n, d);
  const roundStep = (x, step) => Math.round(x / step + 1e-9) * step;
  const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const keyToTime = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
  const timeToMin = s => { const [h, m] = String(s || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  const randomToken = () => Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  /* ---------- данные ---------- */
  const exampleRoutine = () => EXAMPLE_ROUTINE.map(([id, time, title]) => ({ id, time, title, days: [0, 1, 2, 3, 4, 5, 6], on: true, u: 0 }));
  const supplyFromTemplate = t => Object.assign({ qty: null, warnDays: 14, u: 0 }, t);

  function defaults() {
    return {
      version: 2,
      createdAt: Date.now(),
      savedAt: 0,
      settings: {
        u: 0,
        name: '', agreed: false, onboarded: false, theme: 'auto',
        sex: 'f', age: null, height: null, weight: null, activity: 'light', goal: 'keep',
        xeGrams: null,            // сколько граммов углеводов она считает за 1 ХЕ — вводит сама
        carbMode: 'xe',           // 'xe' — ЕД на 1 ХЕ, 'g' — граммов углеводов на 1 ЕД
        rangeLow: 3.9, rangeHigh: 10, target: 6, ketoneLevel: 13.9, hypoCarbs: 15,
        periods: [
          { id: 'morning', name: 'Утро',  start: 5,  ratio: null, isf: null },
          { id: 'day',     name: 'День',  start: 11, ratio: null, isf: null },
          { id: 'evening', name: 'Вечер', start: 17, ratio: null, isf: null },
          { id: 'night',   name: 'Ночь',  start: 22, ratio: null, isf: null },
        ],
        bolusName: '', dia: 4, peak: 75, step: 0.5, maxBolus: 15,
        basalName: '', basalDose: null, basalTime: '22:00', basalStep: 1,
        adaptive: true,
        adjust: { sick: 0, pms: 0, menses: 0, stress: 0, heat: 0, afterSport: 0 },
        loveNotes: [], loveFrom: '',
        cycleLength: 28,
        modules: { routine: true, supplies: true, nutrition: true, cycle: true },
        lastBackup: null,
      },
      entries: [],
      customFoods: [], favFoods: [], recentFoods: [], dishes: [],
      plans: [],
      routine: exampleRoutine(), routineDone: {},
      supplies: SUPPLY_TEMPLATES.slice(0, 5).map(supplyFromTemplate),
      siteLog: [], cycleStarts: [],
      cravings: { resisted: 0, mindful: 0 },
      moods: {}, hypoHandled: 0,
      deleted: {}, calToken: '',
    };
  }

  let data = defaults();
  const hooks = [];

  function migrate(d) {
    const def = defaults();
    const src = d.settings || {};
    const s = Object.assign({}, def.settings, src);
    s.adjust = Object.assign({}, def.settings.adjust, src.adjust || {});
    s.modules = Object.assign({}, def.settings.modules, src.modules || {});
    if (src.cycleOn === false) s.modules.cycle = false;
    delete s.cycleOn; delete s.basalPerDay;
    if (!Array.isArray(s.periods) || s.periods.length !== 4) s.periods = def.settings.periods;
    const out = Object.assign(def, d, { settings: s, version: 2 });
    out.deleted = out.deleted || {};
    for (const c of ['entries', 'plans', 'customFoods', 'dishes', 'routine', 'supplies']) {
      out[c] = (out[c] || []).map(x => (x.u == null ? Object.assign({}, x, { u: x.t || x.created || 0 }) : x));
    }
    if (!Array.isArray(out.recentFoods)) out.recentFoods = [];
    return out;
  }

  function load(storage = globalThis.localStorage) {
    try {
      const raw = storage && storage.getItem(KEY);
      data = raw ? migrate(JSON.parse(raw)) : defaults();
    } catch (e) {
      console.error('Не удалось прочитать данные', e);
      data = defaults();
    }
    sortEntries();
    return data;
  }

  function save(opts = {}) {
    if (!opts.keepTime) data.savedAt = Date.now();
    let ok = true;
    try { globalThis.localStorage && globalThis.localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { console.error('Не удалось сохранить данные', e); ok = false; }
    if (!opts.silent) hooks.forEach(f => { try { f(); } catch (e) { console.error(e); } });
    return ok;
  }
  const onSave = f => hooks.push(f);

  function replaceAll(obj, opts = {}) {
    if (!obj || typeof obj !== 'object' || !Array.isArray(obj.entries)) throw new Error('Это не файл СахарОК');
    data = migrate(obj);
    sortEntries();
    save(Object.assign({ keepTime: true }, opts));
    return data;
  }
  function reset() { data = defaults(); save(); return data; }

  const get = () => data;
  const sortEntries = () => data.entries.sort((a, b) => a.t - b.t);

  // Все изменения коллекций идут через put/del — так синхронизация понимает, что новее.
  function put(col, item) {
    item.u = Date.now();
    const arr = data[col];
    const i = arr.findIndex(x => x.id === item.id);
    if (i >= 0) arr[i] = item; else arr.push(item);
    if (col === 'entries') sortEntries();
    save();
    return item;
  }
  function del(col, id) {
    data[col] = data[col].filter(x => x.id !== id);
    data.deleted[id] = Date.now();
    save();
  }
  function touchSettings() { data.settings.u = Date.now(); save(); }

  const addEntry = e => put('entries', Object.assign({ id: uid(), t: Date.now() }, e));
  const removeEntry = id => del('entries', id);

  /* ---------- синхронизация: слияние двух копий ---------- */
  const COLLECTIONS = ['entries', 'plans', 'customFoods', 'dishes', 'routine', 'supplies'];
  const stamp = x => x.u || x.t || 0;

  function merge(localRaw, remoteRaw) {
    const A = migrate(JSON.parse(JSON.stringify(localRaw)));
    const B = migrate(JSON.parse(JSON.stringify(remoteRaw)));
    // свежее устройство без записей просто берёт копию из облака
    if (!A.entries.length && !A.settings.onboarded) return B;
    const newer = (B.savedAt || 0) > (A.savedAt || 0) ? B : A;
    const older = newer === A ? B : A;
    const out = migrate(JSON.parse(JSON.stringify(newer)));
    const deleted = Object.assign({}, A.deleted);
    for (const [id, t] of Object.entries(B.deleted)) deleted[id] = Math.max(deleted[id] || 0, t);
    for (const c of COLLECTIONS) {
      const map = new Map();
      for (const it of [...A[c], ...B[c]]) {
        const prev = map.get(it.id);
        if (!prev || stamp(it) > stamp(prev)) map.set(it.id, it);
      }
      out[c] = [...map.values()].filter(it => !(deleted[it.id] >= stamp(it)));
    }
    out.settings = (B.settings.u || 0) > (A.settings.u || 0) ? B.settings : A.settings;
    const sites = new Map();
    [...A.siteLog, ...B.siteLog].forEach(x => sites.set(x.t + x.site, x));
    out.siteLog = [...sites.values()].sort((a, b) => a.t - b.t).slice(-400);
    out.moods = Object.assign({}, older.moods, newer.moods);
    out.routineDone = Object.assign({}, older.routineDone, newer.routineDone);
    out.cycleStarts = newer.cycleStarts.length || !older.cycleStarts.length ? newer.cycleStarts : older.cycleStarts;
    out.cravings = { resisted: Math.max(A.cravings.resisted, B.cravings.resisted), mindful: Math.max(A.cravings.mindful, B.cravings.mindful) };
    out.hypoHandled = Math.max(A.hypoHandled || 0, B.hypoHandled || 0);
    out.calToken = A.calToken || B.calToken;
    const cut = Date.now() - 120 * DAY;
    out.deleted = Object.fromEntries(Object.entries(deleted).filter(([, t]) => t > cut));
    out.savedAt = Math.max(A.savedAt || 0, B.savedAt || 0);
    out.entries.sort((a, b) => a.t - b.t);
    return out;
  }

  /* ---------- время суток и коэффициенты ---------- */
  function periodFor(t) {
    const h = new Date(t).getHours();
    const ps = data.settings.periods.slice().sort((a, b) => a.start - b.start);
    let cur = ps[ps.length - 1];               // до первого периода — ещё «ночь»
    for (const p of ps) if (h >= p.start) cur = p;
    return cur;
  }

  function unitsPerGram(p) {
    const s = data.settings;
    if (!(p.ratio > 0)) return null;
    if (s.carbMode === 'xe') return s.xeGrams > 0 ? p.ratio / s.xeGrams : null;
    return 1 / p.ratio;
  }

  const isConfigured = () => {
    const s = data.settings;
    return s.xeGrams > 0 && s.target > 0 && s.periods.every(p => p.ratio > 0 && p.isf > 0);
  };

  /* ---------- активный инсулин ----------
   * Экспоненциальная модель действия инсулина (как в OpenAPS/Loop):
   * dia — сколько часов работает инсулин, peak — минут до пика действия. */
  function iobFraction(minutes, diaH = data.settings.dia, peakMin = data.settings.peak) {
    const td = Math.max(2, diaH) * 60;
    if (minutes <= 0) return 1;
    if (minutes >= td) return 0;
    const tp = Math.min(peakMin, td * 0.45);
    const tau = tp * (1 - tp / td) / (1 - 2 * tp / td);
    const a = 2 * tau / td;
    const S = 1 / (1 - a + (1 + a) * Math.exp(-td / tau));
    const t = minutes;
    const f = 1 - S * (1 - a) * ((t * t / (tau * td * (1 - a)) - t / tau - 1) * Math.exp(-t / tau) + 1);
    return clamp(f, 0, 1);
  }

  function iobAt(at = Date.now()) {
    const td = data.settings.dia * HOUR;
    let units = 0, last = null;
    for (const e of data.entries) {
      if (!(e.bolus > 0) || e.t > at || at - e.t >= td) continue;
      units += e.bolus * iobFraction((at - e.t) / MIN);
      if (!last || e.t > last.t) last = e;
    }
    return { units, last, endsAt: last ? last.t + td : null };
  }

  // активный инсулин непосредственно перед записью с индексом i (без неё самой)
  function iobBefore(i) {
    const es = data.entries, e = es[i], td = data.settings.dia * HOUR;
    let u = 0;
    for (let j = i - 1; j >= 0; j--) {
      const x = es[j];
      if (e.t - x.t >= td) break;
      if (x.bolus > 0 && x.t < e.t) u += x.bolus * iobFraction((e.t - x.t) / MIN);
    }
    return u;
  }

  /* ---------- зоны сахара ---------- */
  function zone(v) {
    const s = data.settings;
    if (v == null) return 'none';
    if (v < 3.0) return 'vlow';
    if (v < s.rangeLow) return 'low';
    if (v <= s.rangeHigh) return 'ok';
    if (v <= 13.9) return 'high';
    return 'vhigh';
  }
  const ZONE_LABEL = { vlow: 'очень низкий', low: 'низкий', ok: 'в цели', high: 'высокий', vhigh: 'очень высокий', none: '' };

  /* ---------- состояние «сейчас»: тренд, недавние гипо, нагрузка, цикл, метки ---------- */
  function trendFor(glucose, at = Date.now()) {
    if (glucose == null) return null;
    for (let i = data.entries.length - 1; i >= 0; i--) {
      const e = data.entries[i];
      if (e.t > at - 15 * MIN) continue;
      if (e.t < at - 90 * MIN) break;
      if (e.glucose == null) continue;
      return { rate: (glucose - e.glucose) / ((at - e.t) / HOUR), prev: e, mins: Math.round((at - e.t) / MIN) };
    }
    return null;
  }

  function stateNow(at = Date.now()) {
    const s = data.settings, d0 = startOfDay(at);
    const today = data.entries.filter(e => e.t >= d0 && e.t <= at);
    const tagsToday = new Set(today.flatMap(e => e.tags || []));
    const sport = [...data.entries].reverse().find(e => e.t <= at && e.t > at - DAY && ((e.activity && e.activity.min >= 20) || (e.tags || []).includes('sport')));
    const recentHypo = [...data.entries].reverse().find(e => e.t <= at && e.t > at - 12 * HOUR && e.glucose != null && e.glucose < s.rangeLow) || null;
    const ci = cycleInfo(at);
    const flags = {};
    for (const a of ADJUST) if (a.id !== 'afterSport' && tagsToday.has(a.tag)) flags[a.id] = 'отмечено сегодня';
    if (ci && ci.phase === 'pms' && !flags.pms) flags.pms = 'по циклу';
    if (ci && ci.phase === 'menses' && !flags.menses) flags.menses = 'по циклу';
    if (sport) flags.afterSport = at - sport.t < 2 * HOUR ? 'только что' : 'за последние сутки';
    return { flags, recentHypo, sport: sport || null, tagsToday, cycle: ci };
  }

  /* ---------- обучение на её истории ----------
   * Для каждого приёма пищи с уколом смотрим замер через 2,5–5 часов и считаем,
   * сколько инсулина на самом деле понадобилось бы, чтобы прийти к цели.
   * Медиана по последним 4 неделям даёт поправку к коэффициенту — с жёсткими
   * ограничениями: рост дозы не больше +10%, снижение не больше −20%, после гипо — только вниз. */
  let learnCache = { key: '', val: null };
  function learn(at = Date.now()) {
    const key = `${data.savedAt}:${data.entries.length}:${Math.floor(at / (30 * MIN))}`;
    if (learnCache.key === key) return learnCache.val;
    const s = data.settings, es = data.entries, from = at - 28 * DAY;
    const G = {};
    s.periods.forEach(p => { G[p.id] = { food: [], isf: [], deltas: [], lowsFood: 0, lowsCorr: 0 }; });
    const skip = new Set(['sport', 'sick', 'alcohol', 'fatty', 'hypo']);
    for (let i = 0; i < es.length; i++) {
      const e = es[i];
      if (e.t < from || e.t >= at || !(e.bolus > 0) || e.glucose == null) continue;
      if (e.activity || (e.tags || []).some(t => skip.has(t))) continue;
      let out = null, low = false;
      for (let j = i + 1; j < es.length; j++) {
        const x = es[j];
        if (x.t - e.t > 5 * HOUR) break;
        if (x.glucose != null && x.glucose < s.rangeLow) { out = x; low = true; break; }
        if (x.carbs > 0 || x.bolus > 0) break;
        if (x.glucose != null && x.t - e.t >= 2.5 * HOUR) { out = x; break; }
      }
      if (!out) continue;
      const p = periodFor(e.t);
      if (!(p.isf > 0)) continue;
      const g = G[p.id];
      const before = iobBefore(i);
      // Через 2,5–5 часов остаток инсулина и остаток углеводов примерно уравновешивают друг друга,
      // поэтому берём замер как есть: сахар изменился на (еда − инсулин) × ФЧИ.
      const g1 = out.glucose;
      if (e.carbs >= 10) {
        g.deltas.push(out.glucose - e.glucose);
        if (low) g.lowsFood++;
        const need = e.bolus + before + (g1 - e.glucose) / p.isf;
        if (need > 0) g.food.push(need / e.carbs);
      } else if (!(e.carbs > 0) && e.glucose >= s.target + 2) {
        if (low) g.lowsCorr++;
        const eff = e.bolus + before, drop = e.glucose - g1;
        if (eff > 0 && drop > 0) g.isf.push(drop / eff);
      }
    }
    const val = {};
    for (const p of s.periods) {
      const g = G[p.id];
      const r = { n: g.food.length, nCorr: g.isf.length, food: 1, isf: 1, lows: g.lowsFood, lowsCorr: g.lowsCorr, delta: avg(g.deltas) };
      const upg = unitsPerGram(p);
      if (upg && g.food.length >= 4) {
        let f = clamp(median(g.food) / upg, 0.8, 1.1);
        if (g.lowsFood > 0) f = Math.min(f, g.lowsFood >= 2 ? 0.9 : 0.95);
        f = 1 + (f - 1) * Math.min(1, g.food.length / 8);
        r.food = Math.abs(f - 1) < 0.03 ? 1 : f;
      } else if (g.lowsFood >= 2) r.food = 0.9;
      if (p.isf > 0 && g.isf.length >= 3) {
        let k = clamp(median(g.isf) / p.isf, 0.9, 1.25);
        if (g.lowsCorr > 0) k = Math.max(k, 1.1);
        k = 1 + (k - 1) * Math.min(1, g.isf.length / 6);
        r.isf = Math.abs(k - 1) < 0.03 ? 1 : k;
      }
      val[p.id] = r;
    }
    learnCache = { key, val };
    return val;
  }

  /* ---------- калькулятор болюса ----------
   * inp: { glucose, carbs (г), protein, fat, time, exercise (0|25|50|75),
   *        flags: {sick, pms, menses, stress, heat, afterSport, alcohol, fatty}, adaptive } */
  function calcBolus(inp) {
    const s = data.settings;
    const at = inp.time || Date.now();
    const flags = inp.flags || {};
    const p = periodFor(at);
    const res = { period: p, steps: [], warnings: [], tips: [], blocked: false, dose: 0, exact: 0, iob: 0 };

    if (!isConfigured()) {
      res.blocked = true;
      res.warnings.push({ lvl: 'warn', text: 'Не заполнены коэффициенты. Их можно взять у эндокринолога и вписать в настройках.' });
      return res;
    }
    const upg = unitsPerGram(p);
    const g = inp.glucose;
    const carbs = Math.max(0, inp.carbs || 0);
    const st = inp.state || stateNow(at);
    res.carbs = carbs;
    res.xe = carbs / s.xeGrams;
    res.iob = iobAt(at).units;

    if (g != null && g < s.rangeLow) {
      res.blocked = true; res.hypo = true;
      res.warnings.push({ lvl: 'danger', text: `Сахар ${fmt(g)} — это гипогликемия. Сначала ${s.hypoCarbs} г быстрых углеводов и повторный замер через 15 минут. Инсулин на еду — когда сахар поднимется выше ${fmt(s.rangeLow)}.` });
      return res;
    }

    const L = s.adaptive && inp.adaptive !== false ? learn(at)[p.id] : null;
    res.learn = L;

    let food = carbs * upg;
    if (carbs > 0) {
      res.steps.push({ label: 'Еда', how: s.carbMode === 'xe'
        ? `${fmt(res.xe)} ХЕ × ${fmtU(p.ratio)} ЕД`
        : `${fmt(carbs, 0)} г ÷ ${fmtU(p.ratio)} г на 1 ЕД`, val: food });
    }
    if (L && L.food !== 1 && food > 0) {
      const d = food * (L.food - 1);
      food += d;
      res.steps.push({ label: 'По твоей истории', adaptive: true,
        how: `${p.name.toLowerCase()}: ${L.lows ? `после еды бывали гипо (${L.lows})` : `через 2,5–5 ч после еды сахар в среднем ${fmtS(L.delta)}`}, ${L.n} ${plural(L.n, 'приём', 'приёма', 'приёмов')}`, val: d });
    }
    if (inp.exercise > 0 && food > 0) {
      const minus = food * inp.exercise / 100;
      food -= minus;
      res.steps.push({ label: 'Нагрузка после еды', how: `−${inp.exercise}% от дозы на еду`, val: -minus });
    }

    let corr = 0;
    if (g != null) {
      const isf = p.isf * (L && L.isf ? L.isf : 1);
      let gc = g;
      const tr = trendFor(g, at);
      res.trend = tr;
      if (tr && Math.abs(tr.rate) >= 1) {
        const add = clamp(tr.rate * 0.5, -2, 2);
        gc = g + add;
        res.steps.push({ label: tr.rate > 0 ? 'Сахар растёт' : 'Сахар снижается', how: `${fmtS(tr.rate)} ммоль/л в час — беру прогноз на 30 минут: ${fmt(gc)}`, val: null });
      }
      const raw = (gc - s.target) / isf;
      const how = `(${fmt(gc)} − ${fmt(s.target)}) ÷ ${fmt(isf)}${L && L.isf !== 1 ? ', ФЧИ уточнён по истории' : ''}`;
      if (raw > 0) {
        corr = Math.max(0, raw - res.iob);
        res.steps.push({ label: 'Коррекция высокого сахара', how, val: raw });
        if (res.iob > 0.05) res.steps.push({ label: 'Минус активный инсулин', how: 'ещё работает с прошлого укола', val: -Math.min(res.iob, raw) });
        if (corr > 0 && tr && tr.rate <= -2) {
          res.steps.push({ label: 'Сахар быстро падает', how: 'коррекцию не добавляю', val: -corr });
          corr = 0;
        } else if (corr > 0 && st.recentHypo) {
          res.steps.push({ label: 'Недавно была гипо', how: 'коррекцию делаю мягче вдвое', val: -corr / 2 });
          corr /= 2;
        }
      } else if (raw < 0) {
        corr = raw;
        res.steps.push({ label: 'Сахар ниже цели', how, val: raw });
        if (res.iob > 0.3) res.warnings.push({ lvl: 'warn', text: `Ещё действует ${fmt(res.iob)} ЕД с прошлого укола, а сахар ниже цели. Возможно, лучше уменьшить дозу или уколоть сразу после еды.` });
      }
      if (tr && tr.rate <= -2) res.warnings.push({ lvl: 'warn', text: `Сахар быстро падает (${fmtS(tr.rate)} в час). Перемерь через 15–20 минут, прежде чем колоть коррекцию.` });
    } else {
      res.warnings.push({ lvl: 'info', text: 'Сахар не указан — коррекция не посчитана. Лучше измерить перед уколом.' });
    }

    let total = food + corr;
    let pct = 0; const names = [];
    for (const a of ADJUST) if (flags[a.id] && s.adjust[a.id]) { pct += s.adjust[a.id]; names.push(a.label.toLowerCase()); }
    if (pct && total > 0) {
      const d = total * pct / 100;
      total += d;
      res.steps.push({ label: 'Личные поправки', how: `${names.join(', ')}: ${pct > 0 ? '+' : '−'}${Math.abs(pct)}%`, val: d });
    }

    res.food = food; res.corr = corr;
    res.exact = Math.max(0, total);
    res.dose = Math.max(0, roundStep(res.exact, s.step));

    if (res.dose > s.maxBolus) {
      res.overMax = true;
      res.warnings.push({ lvl: 'danger', text: `Доза больше твоего лимита (${fmtU(s.maxBolus)} ЕД). Перепроверь углеводы и сахар — возможно, где-то опечатка.` });
    }
    if (g != null && g >= s.ketoneLevel) {
      res.warnings.push({ lvl: 'warn', text: `Сахар ${fmt(g)} — проверь кетоны. Если они есть, тошнит или болит живот — действуй по плану «больничных дней» от врача и не откладывай звонок.` });
    }
    if (p.id === 'night' && corr > 0) res.warnings.push({ lvl: 'info', text: 'Ночью коррекцию делают осторожнее: проверь сахар через 2–3 часа, перед сном лучше быть около 7–8.' });
    if (flags.alcohol) res.warnings.push({ lvl: 'warn', text: 'Алкоголь снижает сахар с задержкой — до суток. Не делай большие коррекции перед сном, перекуси медленными углеводами и поставь будильник на ночной замер.' });

    const bje = ((inp.protein || 0) * 4 + (inp.fat || 0) * 9) / 100;
    res.bje = bje;
    if (bje >= 2 || flags.fatty) {
      res.tips.push(`${bje >= 2 ? `В этой еде около ${fmt(bje)} БЖЕ (белково-жировых единиц). ` : ''}Жир и белок поднимают сахар позже — через 3–5 часов. Проверь сахар через 3 часа. Можно ли докалывать на БЖЕ и сколько — уточни у своего эндокринолога.`);
    }
    if (inp.exercise > 0) res.tips.push('Перед нагрузкой хорошо быть в районе 7–10. Возьми с собой быстрые углеводы и проверь сахар после — и ещё раз перед сном: нагрузка снижает сахар до суток.');
    if (g != null && carbs > 0) {
      if (g < 5) res.tips.push('Сахар невысокий — уколи прямо перед едой и начни с углеводов.');
      else if (g <= 10) res.tips.push('Укол за 10–15 минут до еды помогает обойтись без скачка после.');
      else res.tips.push('Сахар высокий — после укола подожди 20–30 минут, а еду начни с овощей и белка.');
    }
    if (carbs === 0 && corr > 0) res.tips.push('Это чистая коррекция. Не повторяй её раньше чем через 3 часа — инсулин ещё работает, дозы могут наложиться.');
    return res;
  }

  function plural(n, one, few, many) {
    const a = Math.abs(Math.round(n)) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }

  /* ---------- статистика ---------- */
  function readings(from, to) {
    return data.entries.filter(e => e.glucose != null && e.t >= from && e.t < to);
  }

  function countEpisodes(rs) {
    const low = data.settings.rangeLow;
    let n = 0, lastLow = -Infinity;
    for (const e of rs) if (e.glucose < low) { if (e.t - lastLow > HOUR) n++; lastLow = e.t; }
    return n;
  }

  function stats(from, to) {
    const s = data.settings;
    const rs = readings(from, to);
    const n = rs.length;
    if (!n) return { n: 0 };
    const vals = rs.map(e => e.glucose);
    const mean = avg(vals);
    const sd = n > 1 ? Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1)) : 0;
    const pct = f => vals.filter(f).length / n * 100;
    const days = new Set(rs.map(e => dayKey(e.t))).size;
    return {
      n, days, perDay: n / days, mean, sd,
      cv: mean ? sd / mean * 100 : 0,
      vlow: pct(v => v < 3), low: pct(v => v >= 3 && v < s.rangeLow),
      ok: pct(v => v >= s.rangeLow && v <= s.rangeHigh),
      high: pct(v => v > s.rangeHigh && v <= 13.9), vhigh: pct(v => v > 13.9),
      min: Math.min(...vals), max: Math.max(...vals),
      a1c: (mean + 2.59) / 1.59,     // формула ADAG — ориентир по среднему сахару
      hypos: countEpisodes(rs),
    };
  }

  function periodStats(from, to) {
    const s = data.settings;
    const map = new Map(s.periods.map(p => [p.id, { id: p.id, name: p.name, vals: [] }]));
    for (const e of readings(from, to)) map.get(periodFor(e.t).id).vals.push(e.glucose);
    return [...map.values()].map(g => ({
      id: g.id, name: g.name, n: g.vals.length, mean: avg(g.vals),
      ok: g.vals.length ? g.vals.filter(v => v >= s.rangeLow && v <= s.rangeHigh).length / g.vals.length * 100 : NaN,
      lows: g.vals.filter(v => v < s.rangeLow).length,
      highs: g.vals.filter(v => v > s.rangeHigh).length,
    }));
  }

  function quantile(sorted, q) {
    if (!sorted.length) return NaN;
    const pos = (sorted.length - 1) * q, lo = Math.floor(pos), hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  }

  function hourlyProfile(from, to) {
    const b = Array.from({ length: 24 }, () => []);
    for (const e of readings(from, to)) b[new Date(e.t).getHours()].push(e.glucose);
    return b.map((vals, h) => {
      const s = vals.slice().sort((x, y) => x - y);
      return { h, n: s.length, mean: avg(s), p25: quantile(s, 0.25), p75: quantile(s, 0.75) };
    });
  }

  function dailySummary(from, to) {
    const s = data.settings;
    const days = new Map();
    for (const e of data.entries) {
      if (e.t < from || e.t >= to) continue;
      const k = dayKey(e.t);
      const d = days.get(k) || { key: k, vals: [], carbs: 0, bolus: 0, basal: 0, kcal: 0, protein: 0, fat: 0, tags: new Set() };
      if (e.glucose != null) d.vals.push(e.glucose);
      d.carbs += e.carbs || 0; d.bolus += e.bolus || 0; d.basal += e.basal || 0;
      d.kcal += e.kcal || 0; d.protein += e.protein || 0; d.fat += e.fat || 0;
      (e.tags || []).forEach(t => d.tags.add(t));
      days.set(k, d);
    }
    return [...days.values()].map(d => ({
      ...d, mean: avg(d.vals),
      ok: d.vals.length ? d.vals.filter(v => v >= s.rangeLow && v <= s.rangeHigh).length / d.vals.length * 100 : NaN,
      lows: d.vals.filter(v => v < s.rangeLow).length,
    })).sort((a, b) => a.key < b.key ? -1 : 1);
  }

  function insulinPerDay(from, to) {
    const full = dailySummary(from, to).filter(d => d.bolus > 0 && d.basal > 0);
    if (!full.length) return null;
    const bolus = avg(full.map(d => d.bolus)), basal = avg(full.map(d => d.basal));
    return { days: full.length, bolus, basal, total: bolus + basal, carbs: avg(full.map(d => d.carbs)) };
  }

  /* Реакция на еду: замер до еды → замер через 2–5 часов, без новой еды и уколов между ними. */
  function mealResponse(from, to) {
    const s = data.settings, es = data.entries, groups = {};
    for (let i = 0; i < es.length; i++) {
      const e = es[i];
      if (e.t < from || e.t >= to) continue;
      if (!(e.carbs > 0 && e.bolus > 0 && e.glucose != null)) continue;
      if ((e.tags || []).includes('fatty')) continue;
      let after = null;
      for (let j = i + 1; j < es.length; j++) {
        const x = es[j];
        if (x.t - e.t > 5 * HOUR) break;
        if (x.glucose != null && x.glucose < s.rangeLow) { after = x; break; }
        if (x.carbs > 0 || x.bolus > 0) break;
        if (x.glucose != null && x.t - e.t >= 2 * HOUR) { after = x; break; }
      }
      if (!after) continue;
      const p = periodFor(e.t);
      const g = groups[p.id] || (groups[p.id] = { id: p.id, name: p.name, deltas: [], lows: 0 });
      g.deltas.push(after.glucose - e.glucose);
      if (after.glucose < s.rangeLow) g.lows++;
    }
    return Object.values(groups).map(g => ({ ...g, n: g.deltas.length, mean: avg(g.deltas) }));
  }

  /* ---------- ночной (базальный) инсулин: один укол в сутки ---------- */
  // «Эта ночь» — окно ±12 часов вокруг времени укола: в 1 час ночи укол в 22:00 всё ещё «сегодняшний».
  function nightWindow(at = Date.now()) {
    const d = new Date(at);
    const m = timeToMin(data.settings.basalTime);
    d.setHours(Math.floor(m / 60), m % 60, 0, 0);
    let start = d.getTime() - 12 * HOUR;
    if (at < start) start -= DAY;
    if (at >= start + DAY) start += DAY;
    return { start, end: start + DAY, due: start + 12 * HOUR };
  }
  const basalTonight = (at = Date.now()) => {
    const w = nightWindow(at);
    return data.entries.filter(e => e.basal > 0 && e.t >= w.start && e.t < w.end);
  };

  /* Ночи: последний замер 21:00–00:59 → первый замер 05:00–09:30. */
  function nightAnalysis(from, to) {
    const s = data.settings, es = data.entries;
    const res = { nights: [] };
    for (let d = startOfDay(from); d < to; d += DAY) {
      const inWin = (e, a, b) => e.glucose != null && e.t >= d + a * HOUR && e.t < d + b * HOUR;
      const beds = es.filter(e => inWin(e, 21, 25));
      const morns = es.filter(e => inWin(e, 29, 33.5));
      const mids = es.filter(e => inWin(e, 25, 29));
      const low = es.some(e => inWin(e, 24, 30) && e.glucose < s.rangeLow);
      const bed = beds[beds.length - 1], morn = morns[0];
      if (!bed && !morn && !low) continue;
      const night = { day: d, bed: bed && bed.glucose, morn: morn && morn.glucose, mid: mids.length ? mids[0].glucose : null, low };
      if (bed && morn) {
        night.delta = morn.glucose - bed.glucose;
        // «чистая» ночь: за 3 часа до сна и до утра не было еды и короткого инсулина
        night.clean = !es.some(e => e.t >= bed.t - 3 * HOUR && e.t < morn.t && (e.carbs > 0 || e.bolus > 0));
      }
      res.nights.push(night);
    }
    return res;
  }

  function basalAdvice(days = 14, at = Date.now()) {
    const s = data.settings;
    const na = nightAnalysis(at - days * DAY, at);
    const recent = na.nights.slice(-7);
    const clean = recent.filter(n => n.clean);
    const out = { nights: na.nights, clean, verdict: 'nodata', title: '', text: '', lowNights: 0 };
    const lowNights = recent.filter(n => n.low);
    out.lowNights = lowNights.length;
    if (lowNights.length) {
      out.somogyi = lowNights.some(n => n.morn != null && n.morn > s.rangeHigh);
      out.verdict = 'down';
      out.title = lowNights.length === 1 ? 'Была ночная гипо' : `Ночные гипо: ${lowNights.length} за неделю`;
      out.text = 'Это главный сигнал: ночную дозу обычно снижают на 10–20%. Перед сном держи сахар около 7–8 и проверь, не было ли вечером нагрузки или алкоголя.'
        + (out.somogyi ? ' Высокий сахар утром после ночной гипо — это может быть откат (эффект Сомоджи): дозу в этом случае не повышают, а снижают.' : '');
      return out;
    }
    if (clean.length < 3) {
      out.title = 'Пока мало данных по ночам';
      out.text = `Нужно хотя бы 3 ночи с замером перед сном (21:00–01:00) и утром (05:00–09:30), без еды и коротких уколов за 3 часа до сна. Сейчас таких: ${clean.length}.`;
      return out;
    }
    const delta = avg(clean.map(n => n.delta));
    const morn = avg(clean.map(n => n.morn));
    out.delta = delta; out.morn = morn;
    const mids = clean.filter(n => n.mid != null);
    out.dawn = mids.length >= 2 && avg(mids.map(n => n.mid - n.bed)) < 1 && delta > 1.5;
    if (delta > 1.5) {
      out.verdict = 'up';
      out.title = `За ночь сахар растёт в среднем на ${fmtS(delta)}`;
      out.text = out.dawn
        ? 'В 3 часа ночи сахар ещё ровный, а к утру растёт — похоже на феномен утренней зари. Его не всегда исправляют увеличением дозы: обсуди с врачом время укола или другой инсулин.'
        : 'Похоже, ночного инсулина немного не хватает. Обычно дозу повышают примерно на 10% и смотрят 3 ночи. Замер в 3 часа ночи поможет отличить это от феномена утренней зари.';
    } else if (delta < -1.5) {
      out.verdict = 'down';
      out.title = `За ночь сахар падает в среднем на ${fmt(Math.abs(delta))}`;
      out.text = 'Похоже, ночного инсулина многовато. Обычно дозу снижают примерно на 10% и смотрят 3 ночи.';
    } else if (morn > s.rangeHigh) {
      out.verdict = 'evening';
      out.title = 'Ночь ровная, но утро высокое';
      out.text = 'За ночь сахар почти не меняется — значит, ночная доза работает. Утро высокое потому, что ложишься уже с высоким сахаром: стоит посмотреть на ужин и вечерний укол.';
    } else {
      out.verdict = 'ok';
      out.title = 'Ночная доза подобрана хорошо';
      out.text = `За ночь сахар меняется в среднем на ${fmtS(delta)} — в пределах нормы (±1,5).`;
    }
    return out;
  }

  /* Доза ночного инсулина на сегодня: обычная доза + выводы по последним ночам + что было сегодня. */
  function basalPlan(at = Date.now()) {
    const s = data.settings;
    if (!(s.basalDose > 0)) return { dose: null, base: null, change: 0, reasons: [], adv: basalAdvice(14, at) };
    const base = s.basalDose, step = s.basalStep || 1;
    const ten = Math.max(step, roundStep(base * 0.1, step));
    const adv = basalAdvice(14, at);
    const reasons = [];
    let change = 0;
    const last = data.entries.filter(e => e.basal > 0 && e.t < nightWindow(at).start).slice(-4).map(e => e.basal);
    const changedRecently = last.length >= 2 && last.slice(1).some((v, i) => Math.abs(v - last[i]) >= step);
    if (adv.verdict === 'down') {
      change -= adv.lowNights >= 2 ? 2 * ten : ten;
      reasons.push(adv.title);
    } else if (adv.verdict === 'up' && !adv.dawn) {
      if (changedRecently) reasons.push('Доза недавно менялась — ей нужно 3 ночи, потом посмотрим снова');
      else { change += ten; reasons.push(adv.title); }
    }
    const st = stateNow(at);
    if (st.sport && change >= 0) { change -= ten; reasons.push('Сегодня была нагрузка — ночью чувствительность к инсулину выше'); }
    if (st.tagsToday.has('sick') && change < 0 && !adv.lowNights) { change = 0; reasons.push('При болезни ночную дозу не снижают'); }
    if (st.tagsToday.has('alcohol')) reasons.push('Был алкоголь: дозу не пропускай, перекуси перед сном и поставь будильник на 3:00');
    change = clamp(change, -roundStep(base * 0.2, step) || -step, Math.max(step, roundStep(base * 0.1, step)));
    const dose = Math.max(step, roundStep(base + change, step));
    return { dose, base, change: dose - base, reasons, adv };
  }

  /* Влияние меток: средний сахар в дни с меткой и без неё. */
  function tagImpact(from, to) {
    const days = dailySummary(from, to).filter(d => d.vals.length);
    const res = [];
    for (const tag of TAGS) {
      if (tag.id === 'hypo') continue;
      const w = days.filter(d => d.tags.has(tag.id)).map(d => d.mean);
      const wo = days.filter(d => !d.tags.has(tag.id)).map(d => d.mean);
      if (w.length >= 2 && wo.length >= 3) res.push({ tag, days: w.length, mean: avg(w), other: avg(wo), diff: avg(w) - avg(wo) });
    }
    return res;
  }

  // Подсказка для личных поправок: насколько сахар отличается в такие дни.
  function adjustSuggestions(at = Date.now()) {
    const out = {};
    for (const t of tagImpact(at - 60 * DAY, at)) {
      const a = ADJUST.find(x => x.tag === t.tag.id);
      if (!a || t.days < 3 || Math.abs(t.diff) < 1) continue;
      out[a.id] = { pct: clamp(Math.round(t.diff / t.other * 50 / 5) * 5, -20, 20), diff: t.diff, days: t.days };
    }
    return out;
  }

  function insights(days = 14) {
    const s = data.settings, out = [];
    const to = Date.now(), from = to - days * DAY;
    const st = stats(from, to);
    if (st.n < 10) {
      out.push({ lvl: 'info', title: 'Нужно чуть больше записей', text: `За ${days} дней — ${st.n} замеров. Подсказки станут точными, когда наберётся хотя бы 10–15 замеров (лучше 4–6 в день).` });
      return out;
    }
    if (st.ok >= 70) out.push({ lvl: 'good', title: `${Math.round(st.ok)}% замеров в цели`, text: 'Это уровень, который рекомендуют эндокринологи (70% и выше).' });
    else out.push({ lvl: 'info', title: `${Math.round(st.ok)}% замеров в цели`, text: 'Ориентир — 70% и выше. Даже +5% — это уже заметно меньше скачков.' });

    if (st.cv > 36) out.push({ lvl: 'warn', title: `Сахар заметно скачет: вариабельность ${Math.round(st.cv)}%`, text: 'Цель — меньше 36%. Чаще всего скачки дают: укол прямо перед едой или после неё, быстрые углеводы без подколки, коррекции чаще чем раз в 3 часа, «перелечивание» гипо сладким, нагрузка без поправки дозы.' });
    else out.push({ lvl: 'good', title: `Сахар стабильный: вариабельность ${Math.round(st.cv)}%`, text: 'Колебания в пределах нормы — цель меньше 36%.' });

    if (st.vlow + st.low > 4) out.push({ lvl: 'warn', title: `Низкий сахар в ${fmt(st.vlow + st.low)}% замеров`, text: 'Цель — меньше 4%. Ниже видно, в какое время гипо бывают чаще.' });

    for (const ps of periodStats(from, to)) {
      if (ps.n < 4) continue;
      if (ps.lows >= 2) out.push({ lvl: 'warn', title: `${ps.name}: ${ps.lows} низких ${plural(ps.lows, 'замер', 'замера', 'замеров')}`, text: `В период «${ps.name.toLowerCase()}» гипо повторяются. Проверь, нет ли в это время нагрузки, пропуска еды или слишком большого коэффициента.` });
      else if (ps.mean > s.rangeHigh) out.push({ lvl: 'info', title: `${ps.name}: в среднем ${fmt(ps.mean)}`, text: `В период «${ps.name.toLowerCase()}» сахар обычно выше цели.` });
    }

    const L = learn(to);
    for (const m of mealResponse(from, to)) {
      if (m.n < 3) continue;
      const nm = m.name.toLowerCase(), lr = L[m.id];
      const auto = s.adaptive && lr && lr.food !== 1 ? ` Калькулятор уже учитывает это: доза на еду ${fmtS((lr.food - 1) * 100, 0)}%.` : '';
      if (m.lows > 0 || m.mean < -2.5) out.push({ lvl: 'warn', title: `После еды (${nm}) сахар падает: ${fmt(m.mean)}`, text: `Проверено по ${m.n} приёмам пищи${m.lows ? `, из них ${m.lows} с гипо` : ''}. Похоже, коэффициент на ${nm} великоват.${auto}` });
      else if (m.mean > 3) out.push({ lvl: 'warn', title: `После еды (${nm}) сахар растёт на ${fmtS(m.mean)}`, text: `Проверено по ${m.n} приёмам пищи. Возможные причины: коэффициент на ${nm} маловат, укол прямо перед едой, недооценка углеводов.${auto}` });
      else out.push({ lvl: 'good', title: `Коэффициент на ${nm} работает`, text: `Через 2–5 часов после еды сахар в среднем меняется на ${fmtS(m.mean)} — это хорошо.` });
    }

    const ba = basalAdvice(days);
    if (ba.verdict !== 'nodata') out.push({ lvl: ba.verdict === 'ok' ? 'good' : 'warn', title: ba.title, text: ba.text });

    for (const t of tagImpact(from, to)) {
      if (Math.abs(t.diff) < 1) continue;
      out.push({ lvl: 'info', title: `${t.tag.label}: сахар ${t.diff > 0 ? 'выше' : 'ниже'} на ${fmt(Math.abs(t.diff))}`, text: `Сравнение дней с меткой «${t.tag.label}» (${t.days}) и остальных. Если это повторяется, можно задать личную поправку в настройках.` });
    }
    if (st.perDay < 4) out.push({ lvl: 'info', title: `Замеров в среднем ${fmt(st.perDay)} в день`, text: 'Для точных подсказок лучше 4–6: перед едой и перед сном. С сенсором (Libre, Dexcom) это делается само.' });
    return out;
  }

  /* ---------- цикл ---------- */
  function cycleInfo(now = Date.now()) {
    const s = data.settings;
    const starts = data.cycleStarts.slice().sort();
    if (!s.modules.cycle || !starts.length) return null;
    const last = keyToTime(starts[starts.length - 1]);
    let len = s.cycleLength;
    if (starts.length >= 3) {
      const gaps = [];
      for (let i = 1; i < starts.length; i++) gaps.push((keyToTime(starts[i]) - keyToTime(starts[i - 1])) / DAY);
      const ok = gaps.slice(-6).filter(g => g >= 20 && g <= 45);
      if (ok.length >= 2) len = Math.round(avg(ok));
    }
    const day = Math.floor((startOfDay(now) - last) / DAY) + 1;
    const untilNext = len - day + 1;
    let phase = 'mid', hint = 'Середина цикла — обычно сахар без сюрпризов.';
    if (day <= 3) { phase = 'menses'; hint = 'Первые дни месячных: у многих чувствительность к инсулину растёт — следи за гипо.'; }
    else if (untilNext <= 7 && untilNext > 0) { phase = 'pms'; hint = 'Неделя перед месячными: гормоны часто поднимают сахар, инсулина может понадобиться больше.'; }
    else if (untilNext <= 0) { phase = 'late'; hint = 'Месячные ожидались — отметь, когда начнутся.'; }
    return { day, len, untilNext, phase, hint };
  }

  /* ---------- питание ---------- */
  function bmiCategory(b) {
    if (b < 18.5) return 'ниже нормы';
    if (b < 25) return 'норма';
    if (b < 30) return 'выше нормы';
    return 'значительно выше нормы';
  }

  // Норма по формуле Миффлина — Сан Жеора × коэффициент активности.
  function nutritionNorm() {
    const s = data.settings;
    if (!(s.age > 0 && s.height > 0 && s.weight > 0)) return null;
    const lvl = ACTIVITY_LEVELS.find(a => a.id === s.activity) || ACTIVITY_LEVELS[1];
    const bmr = 10 * s.weight + 6.25 * s.height - 5 * s.age + (s.sex === 'm' ? 5 : -161);
    const tdee = bmr * lvl.k;
    const bmi = s.weight / (s.height / 100) ** 2;
    const warnings = [];
    let goal = s.goal;
    if (goal === 'lose' && bmi < 20) { goal = 'keep'; warnings.push('При твоём весе снижать его не нужно — норма посчитана на сохранение веса.'); }
    let kcal = tdee * (GOALS.find(g => g.id === goal) || GOALS[0]).k;
    if (goal === 'lose') kcal = Math.max(kcal, bmr * 1.1, s.sex === 'm' ? 1500 : 1300);
    kcal = Math.round(kcal / 10) * 10;
    const protein = Math.round(s.weight * (goal === 'lose' ? 1.4 : goal === 'gain' ? 1.5 : 1.2));
    const fat = Math.round(kcal * 0.3 / 9);
    const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
    const xe = s.xeGrams > 0 ? carbs / s.xeGrams : null;
    return {
      bmr, tdee, kcal, protein, fat, carbs, xe, bmi, bmiCat: bmiCategory(bmi), goal, level: lvl,
      water: Math.round(s.weight * 30 / 50) * 50,
      meals: MEAL_SPLIT.map(([name, part]) => ({ name, kcal: kcal * part, carbs: carbs * part, xe: xe ? xe * part : null })),
      warnings,
    };
  }

  function nutritionDay(from, to) {
    const r = { kcal: 0, protein: 0, fat: 0, carbs: 0, meals: 0, unknownKcal: 0 };
    for (const e of data.entries) {
      if (e.t < from || e.t >= to || (e.tags || []).includes('hypo')) continue;
      if (e.carbs > 0 || e.kcal > 0) r.meals++;
      r.carbs += e.carbs || 0;
      r.protein += e.protein || 0;
      r.fat += e.fat || 0;
      if (e.kcal > 0) r.kcal += e.kcal; else if (e.carbs > 0) r.unknownKcal++;
    }
    return r;
  }

  /* ---------- достижения ---------- */
  function achievements() {
    const days = dailySummary(0, Date.now() + DAY);
    const goodDays = days.filter(d => d.vals.length >= 4 && d.ok >= 70).length;
    const perfect = days.filter(d => d.vals.length >= 4 && d.ok === 100).length;
    const logged = days.filter(d => d.vals.length >= 3).length;
    let noHypo = 0, best = 0;
    for (const d of days) { if (d.vals.length && !d.lows) { noHypo++; best = Math.max(best, noHypo); } else if (d.vals.length) noHypo = 0; }
    const cr = data.cravings.resisted + data.cravings.mindful;
    const plansDone = data.plans.filter(p => p.done).length;
    const a = (id, icon, title, text, cur, goal) => ({ id, icon, title, text, cur: Math.min(cur, goal), goal, done: cur >= goal });
    return [
      a('first', 'pen', 'Первая запись', 'Начать вести дневник', data.entries.length, 1),
      a('week', 'book', 'Неделя дневника', '7 дней, где есть хотя бы 3 замера', logged, 7),
      a('month', 'book', 'Месяц заботы о себе', '30 дней с записями', logged, 30),
      a('target', 'target', 'День в цели', '70% замеров за день в цели (от 4 замеров)', goodDays, 1),
      a('target10', 'award', '10 дней в цели', '10 дней с 70%+ замеров в цели', goodDays, 10),
      a('perfect', 'star', 'Идеальный день', 'Все замеры за день в цели (от 4 замеров)', perfect, 1),
      a('nohypo', 'shield', 'Неделя без гипо', '7 дней подряд с записями и без низкого сахара', best, 7),
      a('craving', 'cookie', 'Сила воли', 'Справиться с тягой к сладкому 5 раз', cr, 5),
      a('hypo', 'lifebuoy', 'Спокойствие в гипо', 'Пройти гипо по правилу 15/15', data.hypoHandled, 1),
      a('routine', 'clock', 'Режим', '7 дней подряд режим выполнен на 80%', routineStats().best, 7),
      a('plans', 'check', 'Всё по плану', 'Выполнить 10 дел', plansDone, 10),
      a('ratio', 'calc', 'Всё посчитано', 'Заполнить свои коэффициенты', isConfigured() ? 1 : 0, 1),
    ];
  }

  function routineFor(key) {
    if (!data.settings.modules.routine) return [];
    const dow = new Date(keyToTime(key)).getDay();
    return data.routine.filter(r => r.on && r.days.includes(dow)).sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
  }

  function routineStats() {
    let cur = 0, best = 0;
    const today = dayKey(Date.now());
    const keys = Object.keys(data.routineDone).sort();
    if (!keys.length) return { cur: 0, best: 0 };
    for (let t = keyToTime(keys[0]); t <= keyToTime(today); t += DAY) {
      const k = dayKey(t);
      const items = routineFor(k);
      const done = (data.routineDone[k] || []).filter(id => items.some(i => i.id === id)).length;
      if (items.length && done / items.length >= 0.8) { cur++; best = Math.max(best, cur); }
      else if (k !== today) cur = 0;
    }
    return { cur, best };
  }

  /* ---------- запасы ---------- */
  const supplyDays = x => (x.qty == null || !(x.perDay > 0)) ? null : x.qty / x.perDay;

  function consumeSupplies(e) {
    let changed = false;
    for (const x of data.supplies) {
      if (x.qty == null) continue;
      let n = 0;
      if (x.auto === 'glucose' && e.glucose != null) n = 1;
      if (x.auto === 'injection') n = (e.bolus > 0 ? 1 : 0) + (e.basal > 0 ? 1 : 0);
      if (n) { x.qty = Math.max(0, x.qty - n); x.u = Date.now(); changed = true; }
    }
    if (changed) save();
  }

  /* ---------- ориентиры для разговора с врачом ---------- */
  function referenceEstimates() {
    const s = data.settings;
    const ins = insulinPerDay(Date.now() - 14 * DAY, Date.now());
    const out = {};
    if (s.weight > 0) out.byWeight = { tddLo: s.weight * 0.5, tddHi: s.weight * 0.8, basalLo: s.weight * 0.5 * 0.4, basalHi: s.weight * 0.8 * 0.5 };
    if (ins && ins.days >= 5) {
      const tdd = ins.total, gPerU = 500 / tdd;
      out.byTdd = { tdd, days: ins.days, basalShare: ins.basal / tdd * 100, basalLo: tdd * 0.4, basalHi: tdd * 0.5, gPerU, ukPerXe: (s.xeGrams || 12) / gPerU, isf: 100 / tdd };
    }
    return out;
  }

  /* ---------- календарь (.ics): дела, режим дня и ночной инсулин ----------
   * Та же логика лежит в supabase/functions/calendar/index.ts для подписки по ссылке. */
  const PLAN_CAT_LABELS = { study: 'Учёба', health: 'Здоровье', home: 'Дом', personal: 'Личное', work: 'Работа', buy: 'Покупки', other: 'Другое' };
  function toICS(d = data, opts = {}) {
    const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const esc = t => String(t == null ? '' : t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    const enc = new TextEncoder();
    const fold = line => {
      const out = []; let cur = '', bytes = 0;
      for (const ch of line) {
        const b = enc.encode(ch).length;
        if (bytes + b > 73) { out.push(cur); cur = ' ' + ch; bytes = 1 + b; } else { cur += ch; bytes += b; }
      }
      out.push(cur);
      return out.join('\r\n');
    };
    const hm = t => { const [h, m] = String(t).split(':'); return pad(+h) + pad(+m) + '00'; };
    const stampNow = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SaharOK//RU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:СахарОК'];
    const ev = (id, lines, alarm) => {
      L.push('BEGIN:VEVENT', `UID:${id}@saharok`, `DTSTAMP:${stampNow}`, ...lines.filter(Boolean));
      if (alarm) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(alarm)}`, 'TRIGGER:PT0M', 'END:VALARM');
      L.push('END:VEVENT');
    };
    const s = d.settings || {};
    for (const p of d.plans || []) {
      if (p.done || !p.date || (opts.plans && !opts.plans.includes(p.id))) continue;
      const desc = [PLAN_CAT_LABELS[p.cat], p.note].filter(Boolean).join(' · ');
      const date = p.date.replace(/-/g, '');
      if (p.time) ev('plan-' + p.id, [`DTSTART:${date}T${hm(p.time)}`, 'DURATION:PT30M', `SUMMARY:${esc(p.title)}`, desc && `DESCRIPTION:${esc(desc)}`], p.title);
      else {
        const next = dayKey(keyToTime(p.date) + DAY + 2 * HOUR).replace(/-/g, '');
        ev('plan-' + p.id, [`DTSTART;VALUE=DATE:${date}`, `DTEND;VALUE=DATE:${next}`, `SUMMARY:${esc(p.title)}`, desc && `DESCRIPTION:${esc(desc)}`]);
      }
    }
    if (!opts.plans && (!s.modules || s.modules.routine !== false)) {
      for (const r of d.routine || []) {
        if (!r.on || !(r.days || []).length) continue;
        ev('routine-' + r.id, [`DTSTART:20260105T${hm(r.time)}`, 'DURATION:PT10M', `RRULE:FREQ=WEEKLY;BYDAY=${r.days.map(i => BYDAY[i]).join(',')}`, `SUMMARY:${esc(r.title)}`], r.title);
      }
    }
    if (!opts.plans && s.basalTime && (s.basalDose || s.basalName)) {
      ev('basal', [`DTSTART:20260105T${hm(s.basalTime)}`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY',
        `SUMMARY:${esc('Ночной инсулин' + (s.basalDose ? ` · ${s.basalDose} ЕД` : ''))}`,
        `DESCRIPTION:${esc('Отметь укол в СахарОК — там же подсказка по дозе на сегодня')}`], 'Ночной инсулин');
    }
    L.push('END:VCALENDAR');
    return L.map(fold).join('\r\n') + '\r\n';
  }

  /* ---------- экспорт ---------- */
  function toCSV() {
    const xg = data.settings.xeGrams || 12;
    const head = ['Дата', 'Время', 'Сахар', 'Углеводы, г', 'ХЕ', 'Ккал', 'Короткий, ЕД', 'Ночной, ЕД', 'Кетоны', 'Метки', 'Еда', 'Заметка'];
    const rows = data.entries.map(e => {
      const d = new Date(e.t);
      return [dayKey(e.t), `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        e.glucose != null ? fmt(e.glucose) : '', e.carbs ? fmt(e.carbs, 0) : '', e.carbs ? fmt(e.carbs / xg) : '', e.kcal ? Math.round(e.kcal) : '',
        e.bolus ? fmtU(e.bolus) : '', e.basal ? fmtU(e.basal) : '', e.ketones != null ? fmt(e.ketones) : '',
        (e.tags || []).map(t => (TAGS.find(x => x.id === t) || { label: t }).label).join(', '), e.food || '', e.note || ''];
    });
    return '﻿' + [head, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
  }

  return {
    KEY, MIN, HOUR, DAY, TAGS, ADJUST, BOLUS_INSULINS, BASAL_INSULINS, SITES, ZONE_LABEL,
    ACTIVITY_LEVELS, GOALS, SUPPLY_TEMPLATES, EXAMPLE_ROUTINE,
    uid, avg, median, clamp, pad, plural, parseNum, fmt, fmtU, fmtS, roundStep, startOfDay, dayKey, keyToTime, timeToMin, randomToken,
    defaults, exampleRoutine, supplyFromTemplate, load, save, onSave, replaceAll, reset, get, put, del, touchSettings,
    addEntry, removeEntry, merge,
    periodFor, unitsPerGram, isConfigured, iobFraction, iobAt, zone, trendFor, stateNow, learn, calcBolus,
    readings, stats, periodStats, hourlyProfile, dailySummary, insulinPerDay, mealResponse,
    nightWindow, basalTonight, nightAnalysis, basalAdvice, basalPlan, tagImpact, adjustSuggestions, insights,
    cycleInfo, nutritionNorm, nutritionDay, achievements, routineFor, routineStats, supplyDays, consumeSupplies,
    referenceEstimates, toCSV, toICS, PLAN_CAT_LABELS,
  };
})();

if (typeof module !== 'undefined') module.exports = Core;
