/* Проверка формул: node tests/core.test.js */
'use strict';
const assert = require('node:assert/strict');
const C = require('../js/core.js');

const near = (a, b, eps = 0.01, msg) => assert.ok(Math.abs(a - b) < eps, `${msg || ''} ожидали ${b}, получили ${a}`);
let passed = 0;
const test = (name, fn) => { fn(); passed++; console.log('✓', name); };

function fresh(over = {}) {
  const d = C.reset();
  Object.assign(d.settings, {
    xeGrams: 12, carbMode: 'xe', target: 6, step: 0.5, maxBolus: 15, dia: 4, peak: 75, adaptive: true,
  }, over);
  d.settings.periods = [
    { id: 'morning', name: 'Утро', start: 5, ratio: 1.5, isf: 2.5 },
    { id: 'day', name: 'День', start: 11, ratio: 1, isf: 3 },
    { id: 'evening', name: 'Вечер', start: 17, ratio: 1.2, isf: 3 },
    { id: 'night', name: 'Ночь', start: 22, ratio: 1, isf: 4 },
  ];
  return d;
}
const at = (h, m = 0, dayOffset = 0) => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d.getTime(); };
let n = 0;
const add = (e) => { const d = C.get(); d.entries.push(Object.assign({ id: 'e' + (n++) }, e)); d.entries.sort((a, b) => a.t - b.t); };

test('активный инсулин: 100% → 0% и убывает', () => {
  fresh();
  assert.equal(C.iobFraction(0), 1);
  assert.equal(C.iobFraction(240), 0);
  let prev = 1;
  for (let t = 10; t <= 240; t += 10) { const f = C.iobFraction(t); assert.ok(f <= prev + 1e-12, `растёт на ${t}`); prev = f; }
  near(C.iobFraction(60), 0.74, 0.02, 'через час');
  near(C.iobFraction(120), 0.34, 0.02, 'через 2 часа');
});

test('без граммов в ХЕ калькулятор закрыт', () => {
  const d = fresh();
  d.settings.xeGrams = null;
  assert.equal(C.isConfigured(), false);
  assert.ok(C.calcBolus({ glucose: 8, carbs: 24, time: at(8) }).blocked);
});

test('свой размер ХЕ: 10 г вместо 12', () => {
  fresh({ xeGrams: 10 });
  const r = C.calcBolus({ glucose: 6, carbs: 40, time: at(8), adaptive: false });
  near(r.xe, 4);
  assert.equal(r.dose, 6);   // 4 ХЕ × 1,5
});

test('доза: еда + коррекция', () => {
  fresh();
  const r = C.calcBolus({ glucose: 8.5, carbs: 48, time: at(8) });
  near(r.food, 6);
  near(r.corr, 1);
  assert.equal(r.dose, 7);
});

test('активный инсулин вычитается только из коррекции', () => {
  fresh();
  add({ t: at(7), bolus: 2 });
  const r = C.calcBolus({ glucose: 8.5, carbs: 48, time: at(8) });
  near(r.iob, 2 * C.iobFraction(60));
  assert.equal(r.corr, 0);
  assert.equal(r.dose, 6);
});

test('сахар ниже цели уменьшает дозу; гипо блокирует', () => {
  fresh();
  assert.equal(C.calcBolus({ glucose: 5, carbs: 48, time: at(8) }).dose, 5.5);
  assert.ok(C.calcBolus({ glucose: 3.5, carbs: 48, time: at(8) }).hypo);
});

test('нагрузка и личные поправки', () => {
  const d = fresh();
  assert.equal(C.calcBolus({ glucose: 6, carbs: 48, time: at(8), exercise: 50 }).dose, 3);
  d.settings.adjust.pms = 10;
  const r = C.calcBolus({ glucose: 8.5, carbs: 48, time: at(8), flags: { pms: true } });
  near(r.exact, 7.7);
});

test('тренд: растущий сахар добавляет к коррекции', () => {
  fresh();
  const now = at(13);
  add({ t: now - 40 * C.MIN, glucose: 7 });
  const r = C.calcBolus({ glucose: 9, carbs: 0, time: now });
  assert.ok(r.trend && r.trend.rate > 2.9);
  near(r.corr, (9 + 1.5 - 6) / 3, 0.02);   // прогноз на 30 минут: +1,5
});

test('недавняя гипо смягчает коррекцию вдвое', () => {
  fresh();
  const now = at(13);
  add({ t: now - 4 * C.HOUR, glucose: 3.4 });
  const r = C.calcBolus({ glucose: 12, carbs: 0, time: now });
  near(r.corr, 1);   // (12 − 6) / 3 = 2, вдвое меньше
});

test('учёт истории: после завтраков сахар растёт — доза на еду чуть больше', () => {
  fresh();
  for (let k = -10; k <= -1; k++) {
    add({ t: at(8, 0, k), glucose: 6, carbs: 48, bolus: 6 });
    add({ t: at(11, 0, k), glucose: 10 });   // через 3 часа +4
  }
  const L = C.learn(at(8))['morning'];
  assert.equal(L.n, 10);
  assert.ok(L.food > 1.05 && L.food <= 1.1, `поправка ${L.food}`);
  const r = C.calcBolus({ glucose: 6, carbs: 48, time: at(8) });
  assert.ok(r.steps.some(s => s.adaptive));
  assert.ok(r.exact > 6.3 && r.exact <= 6.6 + 1e-9, `доза ${r.exact}`);   // потолок +10%
  const off = C.calcBolus({ glucose: 6, carbs: 48, time: at(8), adaptive: false });
  assert.equal(off.dose, 6);
});

test('учёт истории: гипо после еды — доза только вниз', () => {
  fresh();
  for (let k = -6; k <= -1; k++) {
    add({ t: at(13, 0, k), glucose: 7, carbs: 60, bolus: 5 });
    add({ t: at(15, 30, k), glucose: k % 2 ? 3.6 : 5 });
  }
  const L = C.learn(at(13))['day'];
  assert.ok(L.lows >= 2);
  assert.ok(L.food < 1, `поправка ${L.food}`);
  assert.ok(L.food >= 0.8);
});

test('ночной инсулин: окно «этой ночи» вокруг времени укола', () => {
  const d = fresh();
  d.settings.basalTime = '22:00';
  add({ t: at(22, 10, -1), basal: 12 });
  assert.equal(C.basalTonight(at(1, 0)).length, 1);     // в час ночи укол в 22:10 ещё «этой ночи»
  assert.equal(C.basalTonight(at(15, 0)).length, 0);    // днём — уже новая ночь
});

test('ночной инсулин: рост за ночь → +10%, нагрузка сегодня → не повышаем', () => {
  const d = fresh();
  d.settings.basalDose = 14;
  for (let k = -5; k <= -1; k++) {
    add({ t: at(22, 30, k), glucose: 6.5, basal: 14 });
    add({ t: at(7, 0, k + 1), glucose: 9.8 });
  }
  const now = at(18);
  let p = C.basalPlan(now);
  assert.equal(p.adv.verdict, 'up');
  assert.equal(p.dose, 15);
  add({ t: at(16), activity: { kind: 'cardio', min: 60 }, tags: ['sport'] });
  p = C.basalPlan(now);
  assert.equal(p.dose, 14);
  assert.ok(p.reasons.some(r => /нагрузка/.test(r)));
});

test('ночной инсулин: ночная гипо → снизить, эффект Сомоджи', () => {
  const d = fresh();
  d.settings.basalDose = 12;
  add({ t: at(22, 0, -1), glucose: 7 });
  add({ t: at(3, 0), glucose: 3.2 });
  add({ t: at(7, 0), glucose: 11 });
  const p = C.basalPlan(at(18));
  assert.equal(p.adv.verdict, 'down');
  assert.ok(p.adv.somogyi);
  assert.equal(p.dose, 11);
});

test('норма калорий по Миффлину — Сан Жеору', () => {
  const d = fresh();
  Object.assign(d.settings, { sex: 'f', age: 19, height: 165, weight: 55, activity: 'light', goal: 'keep' });
  const nn = C.nutritionNorm();
  near(nn.bmr, 10 * 55 + 6.25 * 165 - 5 * 19 - 161, 0.01);
  assert.equal(nn.kcal, Math.round(nn.bmr * 1.375 / 10) * 10);
  assert.equal(nn.protein, 66);
  near(nn.xe, nn.carbs / 12);
  d.settings.goal = 'lose'; d.settings.weight = 50;   // ИМТ < 20 — снижать не предлагаем
  assert.equal(C.nutritionNorm().goal, 'keep');
});

test('калории и БЖЕ из продуктов', () => {
  fresh();
  const r = C.calcBolus({ glucose: 6, carbs: 36, protein: 30, fat: 30, time: at(13) });
  near(r.bje, (30 * 4 + 30 * 9) / 100);
  assert.ok(r.tips.some(t => /БЖЕ/.test(t)));
});

test('слияние двух устройств: новое побеждает, удалённое не воскресает', () => {
  const base = fresh();
  base.settings.onboarded = true;
  const a = JSON.parse(JSON.stringify(base)), b = JSON.parse(JSON.stringify(base));
  a.entries.push({ id: 'x1', t: 1000, u: 1000, glucose: 5 }, { id: 'x2', t: 2000, u: 2000, glucose: 6 });
  b.entries.push({ id: 'x1', t: 1000, u: 3000, glucose: 5.5 }, { id: 'x3', t: 4000, u: 4000, glucose: 7 });
  b.deleted = { x2: 2500 };
  b.savedAt = 5000; a.savedAt = 4500;
  const m = C.merge(a, b);
  assert.deepEqual(m.entries.map(e => e.id), ['x1', 'x3']);
  assert.equal(m.entries[0].glucose, 5.5);
});

test('календарь .ics: дела, режим и ночной инсулин', () => {
  const d = fresh();
  d.settings.basalName = 'Тресиба'; d.settings.basalDose = 12;
  d.plans.push({ id: 'p1', title: 'Сдать лабу, по Java', date: '2026-10-22', time: '10:00', cat: 'study', done: false });
  d.plans.push({ id: 'p2', title: 'Купить полоски', date: '2026-10-23', time: '', cat: 'buy', done: false });
  const ics = C.toICS(d);
  assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
  assert.ok(ics.includes('DTSTART:20261022T100000'));
  assert.ok(ics.includes('SUMMARY:Сдать лабу\\, по Java'));
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20261023'));
  assert.ok(ics.includes('DTEND;VALUE=DATE:20261024'));
  assert.ok(ics.includes('RRULE:FREQ=WEEKLY;BYDAY='));
  assert.ok(ics.includes('Ночной инсулин · 12 ЕД'));
  assert.ok(ics.split('\r\n').every(l => Buffer.byteLength(l) <= 75), 'строки не длиннее 75 байт');
});

test('CSV экспорт', () => {
  fresh();
  add({ t: at(8), glucose: 5.6, carbs: 24, bolus: 3, kcal: 300 });
  const csv = C.toCSV();
  assert.ok(csv.includes('Сахар') && csv.includes('"5,6"') && csv.includes('"300"'));
});

console.log(`\nВсе проверки пройдены: ${passed}`);
