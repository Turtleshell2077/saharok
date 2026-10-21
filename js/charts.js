/* Простые графики на canvas без внешних библиотек (чтобы всё работало офлайн). */
'use strict';

const Charts = (() => {
  const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const ZONE_VAR = { vlow: '--z-vlow', low: '--z-low', ok: '--z-ok', high: '--z-high', vhigh: '--z-vhigh' };

  function setup(canvas, height) {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement.clientWidth || 320;
    canvas.style.height = height + 'px';
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, height);
    return { ctx, w, h: height };
  }

  function frame(ctx, w, h, pad, yMax, low, high, xLabels) {
    const y = v => pad.t + (1 - (v - 2) / (yMax - 2)) * (h - pad.t - pad.b);
    // целевой коридор
    ctx.fillStyle = css('--chart-band');
    ctx.fillRect(pad.l, y(high), w - pad.l - pad.r, y(low) - y(high));
    // сетка и подписи по Y
    ctx.font = '11px -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (const v of [low, high, 14].filter(v => v < yMax)) {
      ctx.strokeStyle = css('--chart-grid'); ctx.lineWidth = 1;
      ctx.setLineDash(v === 14 ? [] : [4, 4]);
      ctx.beginPath(); ctx.moveTo(pad.l, y(v)); ctx.lineTo(w - pad.r, y(v)); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = css('--muted');
      ctx.fillText(String(v).replace('.', ','), pad.l - 6, y(v));
    }
    // подписи по X
    ctx.textBaseline = 'top';
    xLabels.forEach(([x, label], i) => {
      ctx.textAlign = i === xLabels.length - 1 && x > w - pad.r - 20 ? 'right' : 'center';
      ctx.fillText(label, ctx.textAlign === 'right' ? w - 2 : x, h - pad.b + 6);
    });
    return y;
  }

  function attachTip(canvas, hits) {
    canvas._hits = hits;
    if (canvas._tipBound) return;
    canvas._tipBound = true;
    const tip = document.createElement('div');
    tip.className = 'chart-tip'; tip.hidden = true;
    canvas.parentElement.appendChild(tip);
    const show = ev => {
      const r = canvas.getBoundingClientRect();
      const x = ev.clientX - r.left;
      let best = null, bd = 24;
      for (const p of canvas._hits || []) { const d = Math.abs(p.x - x); if (d < bd) { bd = d; best = p; } }
      if (!best) { tip.hidden = true; return; }
      tip.hidden = false;
      tip.textContent = best.label;
      tip.style.left = Math.min(Math.max(best.x, 60), r.width - 60) + 'px';
      tip.style.top = best.y + 'px';
    };
    canvas.addEventListener('pointermove', show);
    canvas.addEventListener('pointerdown', show);
    canvas.addEventListener('pointerleave', () => { tip.hidden = true; });
  }

  /* График сахара за сутки: точки по зонам, линия, отметки инсулина и еды. */
  function day(canvas, o) {
    const { ctx, w, h } = setup(canvas, 224);
    const pad = { l: 30, r: 10, t: 14, b: 56 };
    const maxV = Math.max(14, ...o.points.map(p => p.v + 1));
    const yMax = Math.min(25, Math.ceil(maxV));
    const x = t => pad.l + (t - o.from) / (o.to - o.from) * (w - pad.l - pad.r);
    const labels = [0, 6, 12, 18, 24].map(hh => [x(o.from + hh * 3600000), String(hh).padStart(2, '0') + ':00']);
    const y = frame(ctx, w, h, pad, yMax, o.low, o.high, labels);
    const hits = [];

    // линия
    if (o.points.length > 1) {
      ctx.strokeStyle = css('--chart-line'); ctx.lineWidth = 2; ctx.lineJoin = 'round';
      ctx.beginPath();
      o.points.forEach((p, i) => { const X = x(p.t), Y = y(Math.min(p.v, yMax)); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      ctx.stroke();
    }
    // точки с кольцом цвета фона
    for (const p of o.points) {
      const X = x(p.t), Y = y(Math.min(p.v, yMax));
      ctx.beginPath(); ctx.arc(X, Y, 6, 0, Math.PI * 2); ctx.fillStyle = css('--surface'); ctx.fill();
      ctx.beginPath(); ctx.arc(X, Y, 4.5, 0, Math.PI * 2); ctx.fillStyle = css(ZONE_VAR[o.zone(p.v)] || '--muted'); ctx.fill();
      hits.push({ x: X, y: Y, label: `${o.time(p.t)} · ${String(p.v.toFixed(1)).replace('.', ',')} ммоль/л` });
    }
    // еда и инсулин — две строки под подписями времени
    const baseY = h - pad.b + 46;
    ctx.font = '10px -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const b of o.boluses) {
      const X = x(b.t);
      ctx.fillStyle = css('--info');
      ctx.beginPath(); ctx.moveTo(X, baseY - 5); ctx.lineTo(X - 5, baseY + 4); ctx.lineTo(X + 5, baseY + 4); ctx.closePath(); ctx.fill();
      hits.push({ x: X, y: baseY - 8, label: `${o.time(b.t)} · ${b.label}` });
    }
    for (const c of o.carbs) {
      const X = x(c.t);
      ctx.fillStyle = css('--z-high');
      ctx.beginPath(); ctx.arc(X, baseY - 14, 4, 0, Math.PI * 2); ctx.fill();
      hits.push({ x: X, y: baseY - 18, label: `${o.time(c.t)} · ${c.label}` });
    }
    attachTip(canvas, hits);
  }

  /* Профиль по часам: средний сахар и разброс (25–75%) за выбранный период. */
  function profile(canvas, o) {
    const { ctx, w, h } = setup(canvas, 200);
    const pad = { l: 30, r: 10, t: 14, b: 24 };
    const has = o.hours.filter(p => p.n > 0);
    const yMax = Math.min(25, Math.ceil(Math.max(14, ...has.map(p => (p.p75 || p.mean) + 1))));
    const x = hh => pad.l + (hh + 0.5) / 24 * (w - pad.l - pad.r);
    const labels = [0, 6, 12, 18, 23].map(hh => [x(hh), String(hh).padStart(2, '0')]);
    const y = frame(ctx, w, h, pad, yMax, o.low, o.high, labels);
    const hits = [];

    // разброс
    const band = o.hours.filter(p => p.n >= 3);
    if (band.length > 1) {
      ctx.fillStyle = css('--accent-soft');
      ctx.globalAlpha = .9;
      let segs = [], cur = [];
      for (const p of o.hours) { if (p.n >= 3) cur.push(p); else if (cur.length) { segs.push(cur); cur = []; } }
      if (cur.length) segs.push(cur);
      for (const s of segs) {
        if (s.length < 2) continue;
        ctx.beginPath();
        s.forEach((p, i) => i ? ctx.lineTo(x(p.h), y(Math.min(p.p75, yMax))) : ctx.moveTo(x(p.h), y(Math.min(p.p75, yMax))));
        s.slice().reverse().forEach(p => ctx.lineTo(x(p.h), y(Math.max(2, p.p25))));
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    // средняя линия: через все часы с замерами (при замерах пальцем часы идут с пропусками)
    ctx.strokeStyle = css('--chart-line'); ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    has.forEach((p, i) => { const X = x(p.h), Y = y(Math.min(p.mean, yMax)); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
    ctx.stroke();
    for (const p of has) {
      const X = x(p.h), Y = y(Math.min(p.mean, yMax));
      ctx.beginPath(); ctx.arc(X, Y, 5.5, 0, Math.PI * 2); ctx.fillStyle = css('--surface'); ctx.fill();
      ctx.beginPath(); ctx.arc(X, Y, 4, 0, Math.PI * 2); ctx.fillStyle = css(ZONE_VAR[o.zone(p.mean)] || '--muted'); ctx.fill();
      hits.push({ x: X, y: Y, label: `${String(p.h).padStart(2, '0')}:00–${String(p.h).padStart(2, '0')}:59 · среднее ${p.mean.toFixed(1).replace('.', ',')} (${p.n} зам.)` });
    }
    attachTip(canvas, hits);
  }

  return { day, profile };
})();
