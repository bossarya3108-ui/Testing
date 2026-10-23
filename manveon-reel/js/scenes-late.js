/* ============================================================
   Scenes 4–6
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   SCENE 4 — 14..21s  CONNECT THE EXPERIENCE
   Website → AI assistant → booking → customers, as an animated
   chain of nodes. Words appear sequentially.
   ------------------------------------------------------------ */
function flowCard(x, y, w, h, t, tOn, title, tag, accent) {
  const p = win(t, tOn, tOn + 0.5, 99, 99);
  if (p <= 0) return null;
  const pop = easeOutBack(p);
  ctx.save();
  ctx.globalAlpha = p;
  ctx.translate(540, y + h / 2);
  ctx.scale(lerp(0.94, 1, pop), lerp(0.94, 1, pop));
  ctx.translate(-540, -(y + h / 2));
  const active = t > tOn + 0.3;
  ctx.shadowColor = active ? accent : 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = active ? 34 : 22;
  glassCard(x, y, w, h, 22);
  ctx.shadowBlur = 0;
  // status dot + title
  ctx.beginPath(); ctx.arc(x + 44, y + 42, 8, 0, Math.PI * 2);
  ctx.fillStyle = active ? accent : 'rgba(150,180,210,0.4)'; ctx.fill();
  if (active) glow(x + 44, y + 42, 22, accent, 0.6);
  text(title, x + 68, y + 51, 28, 700, C.white);
  text(tag, x + 68, y + 84, 21, 400, C.dim);
  ctx.restore();
  return { x, y, w, h };
}

function scene4(t) {
  baseBg(t);
  glow(540, 1050, 950, 'rgba(22,50,100,0.5)', 1);
  glow(180, 600, 420, 'rgba(56,140,248,0.14)', 1);
  glow(900, 1500, 420, 'rgba(163,230,53,0.08)', 1);

  const cw = 660, cx = 540 - cw / 2;
  const ch = 168;
  const ys = [700, 916, 1132, 1348];

  const c1 = flowCard(cx, ys[0], cw, ch, t, 14.2, 'Website', 'Appointment request received', 'rgba(56,189,248,0.9)');
  const c2 = flowCard(cx, ys[1], cw, ch, t, 15.6, 'AI Assistant', 'Answers instantly, day and night', 'rgba(96,165,250,0.9)');
  const c3 = flowCard(cx, ys[2], cw, ch, t, 17.0, 'Booking', 'Confirmed · Sat 10:00', 'rgba(163,230,53,0.9)');
  const c4 = flowCard(cx, ys[3], cw, ch, t, 18.4, 'Customer profile', 'Preferences & history, kept in sync', 'rgba(163,230,53,0.7)');

  // connectors with traveling pulses
  for (let i = 0; i < 3; i++) {
    const on = [15.6, 17.0, 18.4][i];
    const x1 = 540, y1 = ys[i] + ch, y2 = ys[i + 1];
    const lp = win(t, on - 0.15, on + 0.2, 99, 99);
    if (lp <= 0) continue;
    ctx.save();
    ctx.globalAlpha = lp;
    ctx.strokeStyle = 'rgba(120,170,230,0.4)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, y1 + 6); ctx.lineTo(x1, y2 - 6); ctx.stroke();
    // pulse dot
    const pr = (t - on + 0.4) % 1.1;
    if (pr >= 0 && pr <= 1) {
      const py2 = lerp(y1 + 6, y2 - 6, pr);
      glow(x1, py2, 26, 'rgba(163,230,53,0.9)', 0.9);
      ctx.fillStyle = C.lime;
      ctx.beginPath(); ctx.arc(x1, py2, 6, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // in-card micro-content
  // c1: selected service chip
  if (t > 14.5) {
    const p = win(t, 14.5, 14.85, 99, 99);
    ctx.save(); ctx.globalAlpha = p;
    chipOn(cx + 68, ys[0] + 112, 'Balayage & Gloss · selected', C.blueHot);
    ctx.restore();
  }
  // c2: AI Q/A bubbles
  if (t > 15.9) {
    const p = win(t, 15.9, 16.25, 99, 99);
    ctx.save(); ctx.globalAlpha = p;
    chipOn(cx + 68, ys[1] + 110, '“Do you offer bridal packages?”', 'rgba(150,180,210,0.85)');
    chipOn(cx + 68, ys[1] + 146, 'Yes — 3 packages. Shall I hold Sat 10:00?', C.limeSoft);
    ctx.restore();
  }
  // c3: confirmation check + reminder
  if (t > 17.4) {
    const p = win(t, 17.4, 17.75, 99, 99);
    ctx.save(); ctx.globalAlpha = p;
    ctx.beginPath(); ctx.arc(cx + 84, ys[2] + 132, 20, 0, Math.PI * 2);
    ctx.strokeStyle = C.lime; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = C.lime; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + 74, ys[2] + 132); ctx.lineTo(cx + 81, ys[2] + 140); ctx.lineTo(cx + 96, ys[2] + 122); ctx.stroke();
    text('Request confirmed', cx + 118, ys[2] + 126, 22, 600, C.limeSoft);
    ctx.globalAlpha = p * win(t, 19.3, 19.7, 99, 99);
    text('Reminder sent · Sat 8:00', cx + 118, ys[2] + 156, 20, 400, C.dim);
    ctx.restore();
  }
  // c4: avatar + name
  if (t > 18.7) {
    const p = win(t, 18.7, 19.05, 99, 99);
    ctx.save(); ctx.globalAlpha = p;
    const ag = ctx.createLinearGradient(cx + 68, ys[3] + 110, cx + 116, ys[3] + 158);
    ag.addColorStop(0, C.blueHot); ag.addColorStop(1, C.lime);
    ctx.beginPath(); ctx.arc(cx + 92, ys[3] + 134, 24, 0, Math.PI * 2);
    ctx.fillStyle = ag; ctx.fill();
    ctx.fillStyle = '#0A0F1A'; ctx.font = font(700, 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('M', cx + 92, ys[3] + 136);
    text('Maya — colour, balayage', cx + 134, ys[3] + 128, 22, 500, 'rgba(230,240,250,0.9)');
    text('2nd visit · prefers weekends', cx + 134, ys[3] + 158, 20, 400, C.dim);
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  grade(); vignette(0.44); grain(t);

  // sequential words
  const words = [
    ['WEBSITES', 14.2, 15.65],
    ['AI ASSISTANTS', 15.65, 17.05],
    ['AUTOMATION', 17.05, 18.45],
    ['CONNECTED WORKFLOWS', 18.45, 21.0],
  ];
  words.forEach(([wd, a, b], i) => {
    const p = win(t, a, a + 0.35, b - 0.3, b);
    if (p <= 0) return;
    ctx.save();
    ctx.globalAlpha = p;
    const rise = (1 - easeOutCubic(seg(t, a, a + 0.5))) * 26;
    const size = wd.length > 12 ? 58 : 66;
    trackText(wd, W / 2, 470 + rise, size, 800, 6, C.white, { glow: 26 });
    // progress markers
    for (let m = 0; m < 4; m++) {
      ctx.beginPath();
      ctx.arc(W / 2 - 54 + m * 36, 508, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = m <= i ? (m === i ? C.lime : 'rgba(163,230,53,0.55)') : 'rgba(150,180,210,0.25)';
      ctx.fill();
    }
    ctx.restore();
  });

  // disclaimer caption
  const cp = win(t, 19.0, 19.5, 20.6, 21.0);
  if (cp > 0) {
    ctx.save();
    ctx.globalAlpha = cp * 0.85;
    trackText('SOLUTIONS SHAPED AROUND YOUR BUSINESS', W / 2, 1610, 26, 500, 5, C.dim);
    ctx.restore();
  }
}

function chipOn(x, y, label, color) {
  ctx.font = font(500, 21);
  const w = ctx.measureText(label).width + 40;
  rr(x, y - 24, w, 38, 19);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
  ctx.strokeStyle = 'rgba(150,185,220,0.2)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 20, y - 4);
  ctx.textBaseline = 'alphabetic';
}

/* ------------------------------------------------------------
   SCENE 5 — 21..26s  THE BIG PICTURE
   Unified ecosystem orbit + owner serving a customer.
   ------------------------------------------------------------ */
function scene5(t) {
  baseBg(t);
  glow(540, 780, 980, 'rgba(24,54,108,0.55)', 1);

  const inP = easeOutCubic(seg(t, 21.0, 22.0));

  // --- ecosystem orbit (upper half) ---
  ctx.save();
  ctx.translate(540, 760);
  ctx.scale(lerp(1.12, 1, inP), lerp(1.12, 1, inP));
  ctx.translate(-540, -760);

  // orbit rings
  [170, 280].forEach((r, ri) => {
    ctx.save();
    ctx.strokeStyle = `rgba(120,170,230,${0.18 - ri * 0.06})`;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(540, 800, r, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  });

  // center: salon monogram
  const pulse = 1 + 0.03 * Math.sin(t * 2.2);
  glow(540, 760, 150 * pulse, 'rgba(56,140,248,0.35)', 1);
  const mg = ctx.createLinearGradient(470, 690, 610, 830);
  mg.addColorStop(0, 'rgba(28,40,58,0.98)'); mg.addColorStop(1, 'rgba(14,20,32,0.98)');
  ctx.beginPath(); ctx.arc(540, 760, 84, 0, Math.PI * 2);
  ctx.fillStyle = mg; ctx.fill();
  ctx.strokeStyle = 'rgba(190,215,240,0.35)'; ctx.lineWidth = 3; ctx.stroke();
  trackText('L', 540, 776, 64, 300, 4, 'rgba(255,232,196,0.95)', { glow: 20, glowColor: 'rgba(255,214,150,0.5)' });
  trackText('LUMIÈRE', 540, 812, 20, 600, 5, 'rgba(220,232,245,0.75)');

  // orbiting nodes
  const nodes = [
    ['Website',   0.0,  C.blueHot],
    ['Bookings',  1.57, C.lime],
    ['AI Assist', Math.PI, C.blueHot],
    ['Dashboard', Math.PI * 1.5, C.lime],
  ];
  nodes.forEach(([label, phase, col], i) => {
    const r = 280;
    const a = phase + t * 0.22;
    const nx = 540 + Math.cos(a) * r;
    const ny = 760 + Math.sin(a) * r * 0.62;
    // connector to center
    ctx.save();
    ctx.strokeStyle = 'rgba(120,170,230,0.16)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(540, 760); ctx.lineTo(nx, ny); ctx.stroke();
    // traveling pulse toward center
    const pp = ((t * 0.5 + i * 0.25) % 1);
    const px = lerp(nx, 540, pp), py = lerp(ny, 760, pp);
    glow(px, py, 16, col === C.lime ? 'rgba(163,230,53,0.8)' : 'rgba(56,189,248,0.8)', 0.8);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // node
    const ng = ctx.createLinearGradient(nx - 90, ny - 40, nx + 90, ny + 40);
    ng.addColorStop(0, 'rgba(32,44,62,0.97)'); ng.addColorStop(1, 'rgba(16,22,34,0.97)');
    ctx.beginPath(); ctx.arc(nx, ny, 56, 0, Math.PI * 2);
    ctx.fillStyle = ng; ctx.fill();
    ctx.strokeStyle = 'rgba(150,190,230,0.3)'; ctx.lineWidth = 2; ctx.stroke();
    // icon glyph
    ctx.strokeStyle = col; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    ctx.save(); ctx.translate(nx, ny);
    if (i === 0) { ctx.strokeRect(-14, -12, 28, 22); ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(-6, 4); ctx.moveTo(0, -6); ctx.lineTo(0, 4); ctx.moveTo(6, -6); ctx.lineTo(6, 4); ctx.stroke(); }
    if (i === 1) { ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, 2); ctx.moveTo(0, 7); ctx.lineTo(0, 7.5); ctx.stroke(); }
    if (i === 2) { ctx.beginPath(); ctx.moveTo(-12, -9); ctx.quadraticCurveTo(0, -9, 0, 0); ctx.quadraticCurveTo(0, 9, 12, 9); ctx.stroke(); ctx.beginPath(); ctx.arc(-14, -9, 3, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); }
    if (i === 3) { ctx.beginPath(); ctx.moveTo(-13, 9); ctx.lineTo(-13, 1); ctx.moveTo(-4, 9); ctx.lineTo(-4, -7); ctx.moveTo(5, 9); ctx.lineTo(5, -2); ctx.moveTo(13, 9); ctx.lineTo(13, -11); ctx.stroke(); }
    ctx.restore();
    ctx.font = font(600, 21);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(225,235,248,0.9)';
    ctx.fillText(label, nx, ny + 84);
  });
  ctx.restore();

  // --- owner attending a customer (lower half) ---
  const oy = 1240;
  ctx.save();
  ctx.translate(0, lerp(50, 0, inP));
  // warm scene pool
  glow(540, oy + 240, 620, 'rgba(255,196,130,0.10)', 1);
  ctx.fillStyle = '#0A0F17';
  rr(120, oy, 840, 520, 28); ctx.fill();
  ctx.strokeStyle = 'rgba(150,185,225,0.14)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save();
  rr(120, oy, 840, 520, 28); ctx.clip();
  glow(540, oy + 120, 320, 'rgba(255,208,140,0.22)', 1);
  // mirror behind
  rr(360, oy + 60, 360, 300, 150);
  ctx.strokeStyle = 'rgba(220,200,170,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  // two silhouettes: stylist (left) working on customer (right, seated)
  ctx.fillStyle = 'rgba(4,6,10,0.96)';
  // stylist
  ctx.beginPath();
  ctx.moveTo(380, oy + 540); ctx.quadraticCurveTo(372, oy + 240, 430, oy + 216);
  ctx.quadraticCurveTo(470, oy + 208, 470, oy + 250);
  ctx.lineTo(452, oy + 540); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(440, oy + 172, 40, 0, Math.PI * 2); ctx.fill();
  // stylist arms raised toward customer's hair
  ctx.strokeStyle = 'rgba(4,6,10,0.96)'; ctx.lineWidth = 20; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(452, oy + 268); ctx.quadraticCurveTo(500, oy + 230, 545, oy + 205); ctx.stroke();
  // customer seated
  ctx.beginPath();
  ctx.moveTo(640, oy + 540); ctx.quadraticCurveTo(636, oy + 300, 680, oy + 286);
  ctx.quadraticCurveTo(720, oy + 280, 722, oy + 330);
  ctx.lineTo(712, oy + 540); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(672, oy + 240, 38, 0, Math.PI * 2); ctx.fill();
  // warm rim light on both
  ctx.strokeStyle = 'rgba(255,205,140,0.45)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(440, oy + 172, 40, Math.PI * 0.85, Math.PI * 1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(672, oy + 240, 38, Math.PI * 0.8, Math.PI * 1.45); ctx.stroke();
  // vanity counter
  ctx.fillStyle = '#0D121C';
  ctx.fillRect(120, oy + 470, 840, 26);
  // faint connected UI behind (subtle, uncluttered)
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = 'rgba(120,170,230,0.25)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(200, oy + 130); ctx.lineTo(300, oy + 130); ctx.stroke();
  rr(200, oy + 150, 130, 10, 5); ctx.fillStyle = 'rgba(120,170,230,0.18)'; ctx.fill();
  rr(200, oy + 172, 96, 10, 5); ctx.fill();
  ctx.beginPath(); ctx.arc(860, oy + 150, 26, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(163,230,53,0.3)'; ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.restore();
  ctx.restore();

  grade(); vignette(0.46); grain(t);

  // headline
  const tp = win(t, 21.6, 22.3, 25.3, 25.85);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha = tp;
    trackText('LESS MANUAL WORK.', W / 2, 1120, 46, 700, 4, C.white, { glow: 20 });
    trackText('A MORE CONNECTED BUSINESS.', W / 2, 1178, 46, 300, 4, 'rgba(163,230,53,0.95)', { glow: 22, glowColor: 'rgba(163,230,53,0.4)' });
    ctx.restore();
  }
}

/* ------------------------------------------------------------
   SCENE 6 — 26..30s  MANVEON BRAND REVEAL
   ------------------------------------------------------------ */
function drawManveonMark(cx, cy, s, t) {
  // geometric M built from strokes, blue→lime gradient
  ctx.save();
  ctx.translate(cx, cy);
  const g = ctx.createLinearGradient(-s * 0.62, -s * 0.55, s * 0.62, s * 0.55);
  g.addColorStop(0, C.blueHot);
  g.addColorStop(1, C.lime);
  ctx.strokeStyle = g;
  ctx.lineWidth = s * 0.16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(56,140,248,0.5)';
  ctx.shadowBlur = 26;
  ctx.beginPath();
  ctx.moveTo(-s * 0.55,  s * 0.5);
  ctx.lineTo(-s * 0.55, -s * 0.5);
  ctx.lineTo(0,          s * 0.18);
  ctx.lineTo(s * 0.55,  -s * 0.5);
  ctx.lineTo(s * 0.55,   s * 0.5);
  ctx.stroke();
  ctx.restore();
}

function scene6(t) {
  const lt = t - 26;
  // deep navy field
  const g = ctx.createRadialGradient(540, 880, 60, 540, 880, 1100);
  g.addColorStop(0, '#0D1730');
  g.addColorStop(0.6, C.navy);
  g.addColorStop(1, '#04070E');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // restrained dual glow behind logo
  const grow = easeOutCubic(seg(lt, 0.1, 1.4));
  glow(490, 860, 420 * grow, 'rgba(56,130,248,0.16)', grow);
  glow(600, 940, 360 * grow, 'rgba(163,230,53,0.07)', grow);

  // mark
  const mp = easeOutBack(seg(lt, 0.15, 0.95));
  if (mp > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, mp * 1.2);
    drawManveonMark(540, 760, 120 * lerp(0.7, 1, mp), lt);
    ctx.restore();
  }

  // wordmark
  const wp = win(lt, 0.55, 1.1, 99, 99);
  if (wp > 0) {
    ctx.save();
    ctx.globalAlpha = wp;
    const spread = lerp(14, 20, easeOutCubic(seg(lt, 0.55, 2.0)));
    trackText('MANVEON', 540, 1000, 96, 800, spread, C.white, { glow: 34 });
    // light sweep across the wordmark
    const sw = seg(lt, 1.25, 2.15);
    if (sw > 0 && sw < 1) {
      ctx.save();
      rr(180, 916, 720, 110, 20); ctx.clip();
      lightSweep(lt, lerp(120, 960, sw), 970, 260, 0.32, 0.8);
      ctx.restore();
    }
    ctx.restore();
  }

  // tagline + url
  const tp = win(lt, 1.35, 1.85, 99, 99);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha = tp;
    trackText('BUILT FOR THE NEXT ERA', 540, 1088, 34, 500, 12, 'rgba(163,230,53,0.9)', { glow: 18, glowColor: 'rgba(163,230,53,0.35)' });
    trackText('manveon.com', 540, 1148, 30, 400, 6, 'rgba(140,180,225,0.85)');
    ctx.restore();
  }

  // final headline
  const hp = win(lt, 2.3, 2.95, 99, 99);
  if (hp > 0) {
    ctx.save();
    ctx.globalAlpha = hp;
    const rise = (1 - easeOutCubic(seg(lt, 2.3, 3.1))) * 30;
    trackText('YOU BRING THE VISION.', W / 2, 1420 + rise, 52, 700, 4, C.white, { glow: 24 });
    trackText('WE BUILD WHAT’S NEXT.', W / 2, 1496 + rise, 52, 300, 4, 'rgba(163,230,53,0.95)', { glow: 26, glowColor: 'rgba(163,230,53,0.4)' });
    ctx.restore();
  }

  // footnote — conceptual demonstration
  const fp = win(lt, 2.5, 3.0, 99, 99);
  if (fp > 0) {
    ctx.save();
    ctx.globalAlpha = fp * 0.6;
    trackText('CONCEPTUAL DEMONSTRATION · SALON DEPICTED IS ILLUSTRATIVE', W / 2, 1592, 20, 400, 3, 'rgba(160,180,205,0.8)');
    ctx.restore();
  }

  grade(); vignette(0.3); grain(t);
}
