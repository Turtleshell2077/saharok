// СахарОК — календарь для подписки на телефоне: дела с датами, режим дня и ночной инсулин.
// Адрес: https://<проект>.supabase.co/functions/v1/calendar?token=<ссылка из приложения>
// Разворачивать без проверки JWT (календарь не умеет передавать заголовки) —
// доступ закрыт секретным токеном из 32 символов, который знает только приложение.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const CATS: Record<string, string> = { study: 'Учёба', health: 'Здоровье', home: 'Дом', personal: 'Личное', work: 'Работа', buy: 'Покупки', other: 'Другое' };
const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const pad = (n: number) => String(n).padStart(2, '0');
const esc = (t: unknown) => String(t ?? '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const hm = (t: string) => { const [h, m] = t.split(':'); return pad(+h) + pad(+m) + '00'; };
const enc = new TextEncoder();

// строки длиннее 75 байт переносятся по стандарту iCalendar
function fold(line: string): string {
  const out: string[] = [];
  let cur = '', bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > 73) { out.push(cur); cur = ' ' + ch; bytes = 1 + b; } else { cur += ch; bytes += b; }
  }
  out.push(cur);
  return out.join('\r\n');
}

// deno-lint-ignore no-explicit-any
function build(d: any): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SaharOK//RU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'X-WR-CALNAME:СахарОК', 'REFRESH-INTERVAL;VALUE=DURATION:PT1H', 'X-PUBLISHED-TTL:PT1H'];
  const ev = (id: string, lines: (string | false)[], alarm?: string) => {
    L.push('BEGIN:VEVENT', `UID:${id}@saharok`, `DTSTAMP:${now}`, ...lines.filter(Boolean) as string[]);
    if (alarm) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(alarm)}`, 'TRIGGER:PT0M', 'END:VALARM');
    L.push('END:VEVENT');
  };
  const s = d.settings ?? {};

  for (const p of d.plans ?? []) {
    if (p.done || !p.date) continue;
    const desc = [CATS[p.cat], p.note].filter(Boolean).join(' · ');
    const date = String(p.date).replace(/-/g, '');
    if (p.time) {
      ev('plan-' + p.id, [`DTSTART:${date}T${hm(p.time)}`, 'DURATION:PT30M', `SUMMARY:${esc(p.title)}`, !!desc && `DESCRIPTION:${esc(desc)}`], p.title);
    } else {
      const next = new Date(p.date + 'T12:00:00Z');
      next.setUTCDate(next.getUTCDate() + 1);
      ev('plan-' + p.id, [`DTSTART;VALUE=DATE:${date}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, '')}`,
        `SUMMARY:${esc(p.title)}`, !!desc && `DESCRIPTION:${esc(desc)}`]);
    }
  }

  if (s.modules?.routine !== false) {
    for (const r of d.routine ?? []) {
      if (!r.on || !r.days?.length) continue;
      ev('routine-' + r.id, [`DTSTART:20260105T${hm(r.time)}`, 'DURATION:PT10M',
        `RRULE:FREQ=WEEKLY;BYDAY=${r.days.map((i: number) => BYDAY[i]).join(',')}`, `SUMMARY:${esc(r.title)}`], r.title);
    }
  }

  if (s.basalTime && (s.basalDose || s.basalName)) {
    ev('basal', [`DTSTART:20260105T${hm(s.basalTime)}`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY',
      `SUMMARY:${esc('Ночной инсулин' + (s.basalDose ? ` · ${s.basalDose} ЕД` : ''))}`,
      `DESCRIPTION:${esc('Отметь укол в СахарОК — там же подсказка по дозе на сегодня')}`], 'Ночной инсулин');
  }

  L.push('END:VCALENDAR');
  return L.map(fold).join('\r\n') + '\r\n';
}

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  if (!/^[a-f0-9]{32}$/.test(token)) return new Response('Not found', { status: 404 });

  const headers: Record<string, string> = { apikey: SERVICE_KEY };
  if (SERVICE_KEY.startsWith('eyJ')) headers.Authorization = `Bearer ${SERVICE_KEY}`;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/user_data?select=data&cal_token=eq.${token}`, { headers });
  if (!r.ok) return new Response('Server error', { status: 500 });
  const rows = await r.json();
  if (!rows.length) return new Response('Not found', { status: 404 });

  return new Response(build(rows[0].data), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
});
