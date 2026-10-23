/* ============================================================
   Scenes 1–3
   ============================================================ */
'use strict';

/* ------------------------------------------------------------
   SCENE 1 — 0..4s  THE VISION
   Storefront push-in, crossfade to interior, founder preparing.
   ------------------------------------------------------------ */
function drawStorefront(t) {
  baseBg(t);
  // night sky ambience
  glow(540, 300, 900, 'rgba(20,44,88,0.55)', 1);
  glow(880, 1250, 500, 'rgba(40,80,150,0.25)', 1);

  // camera push-in
  const push = lerp(1.055, 1.0, easeOutCubic(seg(t, 0, 4)));
  const drift = lerp(-14, 0, easeOutCubic(seg(t, 0, 4)));
  ctx.save();
  ctx.translate(W/2 + drift, H*0.52);
  ctx.scale(push, push);
  ctx.translate(-W/2, -H*0.52);

  // sidewalk
  ctx.fillStyle = '#0A0F18';
  ctx.fillRect(0, 1330, W, H);

  // facade
  const fg = ctx.createLinearGradient(0, 620, 0, 1330);
  fg.addColorStop(0, '#131A26');
  fg.addColorStop(1, '#0C111B');
  ctx.fillStyle = fg;
  ctx.fillRect(90, 620, 900, 710);

  // sign band
  ctx.fillStyle = '#0B101A';
  ctx.fillRect(90, 620, 900, 150);
  ctx.strokeStyle = 'rgba(190,214,240,0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(90, 770); ctx.lineTo(990, 770); ctx.stroke();
  // sign glow — warm white
  const signGlow = 0.75 + 0.25 * Math.sin(t * 2.2);
  glow(540, 700, 300, `rgba(255,214,150,${0.16 * signGlow})`, 1);
  trackText('L U M I È R E', 540, 712, 56, 300, 10, 'rgba(255,236,205,0.92)', { glow: 26, glowColor: `rgba(255,214,150,${0.55 * signGlow})` });
  trackText('SALON & SPA', 540, 756, 22, 500, 9, 'rgba(255,224,180,0.5)');

  // storefront windows — warm inviting light
  const winGlow = 0.85 + 0.15 * Math.sin(t * 1.4);
  [[150, 960, 340, 330], [590, 960, 340, 330]].forEach(([x, y, w, h], i) => {
    const wg = ctx.createLinearGradient(x, y, x, y + h);
    wg.addColorStop(0, `rgba(255,205,140,${0.30 * winGlow})`);
    wg.addColorStop(0.6, `rgba(230,160,90,${0.16 * winGlow})`);
    wg.addColorStop(1, `rgba(150,90,40,${0.07 * winGlow})`);
    rr(x, y, w, h, 10);
    ctx.fillStyle = wg; ctx.fill();
    ctx.strokeStyle = 'rgba(210,180,140,0.28)'; ctx.lineWidth = 3; ctx.stroke();
    // mullions
    ctx.strokeStyle = 'rgba(12,16,24,0.85)'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(x + w/2, y); ctx.lineTo(x + w/2, y + h); ctx.stroke();
    // interior silhouettes: a station + mirror hint
    ctx.save();
    rr(x, y, w, h, 10); ctx.clip();
    ctx.fillStyle = `rgba(30,18,8,${0.55})`;
    ctx.fillRect(x + 40, y + 130, 26, 200);          // station pole
    ctx.fillRect(x + 18, y + 316, 70, 14);           // counter
    rr(x + w - 130, y + 90, 90, 130, 45);            // mirror
    ctx.strokeStyle = `rgba(255,220,170,${0.35 * winGlow})`; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    // light spill onto sidewalk
    const spill = ctx.createLinearGradient(0, y + h, 0, y + h + 150);
    spill.addColorStop(0, `rgba(255,190,120,${0.14 * winGlow})`);
    spill.addColorStop(1, 'rgba(255,190,120,0)');
    ctx.fillStyle = spill;
    ctx.fillRect(x - 40, y + h, w + 80, 150);
  });

  // door between windows
  ctx.fillStyle = '#0E141F';
  rr(505, 980, 70, 350, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(210,180,140,0.22)'; ctx.lineWidth = 2; ctx.stroke();
  glow(540, 1150, 90, 'rgba(255,200,130,0.10)', 1);

  // hanging bulb over door
  ctx.strokeStyle = 'rgba(160,190,220,0.3)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(540, 770); ctx.lineTo(540, 880); ctx.stroke();
  glow(540, 892, 46, 'rgba(255,214,150,0.85)', 1);
  ctx.fillStyle = '#FFE2B0';
  ctx.beginPath(); ctx.arc(540, 892, 7, 0, Math.PI*2); ctx.fill();

  ctx.restore();

  // depth-of-field foreground: out-of-focus plant leaves
  ctx.save();
  ctx.filter = 'blur(14px)';
  ctx.fillStyle = 'rgba(6,10,14,0.85)';
  ctx.beginPath(); ctx.ellipse(60, 1850, 190, 130, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(1030, 1880, 200, 140, 0.35, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawSalonInterior(t) {
  baseBg(t);
  glow(540, 760, 950, 'rgba(24,50,96,0.5)', 1);

  const rise = easeOutCubic(seg(t, 0, 2.2));
  ctx.save();
  ctx.translate(0, lerp(40, 0, rise));
  ctx.scale(lerp(1.05, 1, rise), lerp(1.05, 1, rise));

  // back wall
  const wall = ctx.createLinearGradient(0, 500, 0, 1500);
  wall.addColorStop(0, '#141B28');
  wall.addColorStop(1, '#0B101A');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 500, W, 1000);
  ctx.fillStyle = '#080C13';
  ctx.fillRect(0, 1450, W, 470);

  // ceiling warm downlights
  for (let i = 0; i < 3; i++) {
    const x = 270 + i * 270;
    glow(x, 560, 190, 'rgba(255,205,140,0.30)', 1);
    ctx.fillStyle = 'rgba(255,220,170,0.9)';
    ctx.beginPath(); ctx.arc(x, 556, 5, 0, Math.PI*2); ctx.fill();
  }

  // three styling stations with mirrors
  for (let i = 0; i < 3; i++) {
    const x = 270 + i * 270;
    // mirror
    const mg = ctx.createLinearGradient(x - 105, 780, x + 105, 1160);
    mg.addColorStop(0, 'rgba(150,190,235,0.20)');
    mg.addColorStop(0.5, 'rgba(90,130,180,0.10)');
    mg.addColorStop(1, 'rgba(150,190,235,0.16)');
    rr(x - 105, 780, 210, 380, 100);
    ctx.fillStyle = mg; ctx.fill();
    ctx.strokeStyle = 'rgba(220,200,170,0.4)'; ctx.lineWidth = 4; ctx.stroke();
    // vanity
    ctx.fillStyle = '#10151F';
    rr(x - 120, 1160, 240, 40, 8); ctx.fill();
    ctx.fillStyle = '#0C111A';
    rr(x - 110, 1200, 220, 190, 10); ctx.fill();
    // vanity bulbs
    glow(x, 1160, 130, 'rgba(255,208,140,0.16)', 1);
    // chair silhouette
    ctx.fillStyle = 'rgba(5,8,12,0.9)';
    rr(x - 55, 1230, 110, 200, 26); ctx.fill();
  }

  // founder silhouette preparing at center station
  const sway = Math.sin(t * 1.1) * 4;
  ctx.save();
  ctx.translate(540 + sway, 0);
  ctx.fillStyle = 'rgba(4,6,10,0.96)';
  // body
  ctx.beginPath();
  ctx.moveTo(-46, 1480); ctx.quadraticCurveTo(-50, 1220, 0, 1190);
  ctx.quadraticCurveTo(50, 1220, 46, 1480); ctx.closePath(); ctx.fill();
  // head
  ctx.beginPath(); ctx.arc(0, 1140, 52, 0, Math.PI*2); ctx.fill();
  // arm arranging product on vanity
  ctx.strokeStyle = 'rgba(4,6,10,0.96)'; ctx.lineWidth = 26; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(20, 1260); ctx.quadraticCurveTo(90, 1210, 120 + sway, 1160); ctx.stroke();
  // rim light from vanity bulbs
  ctx.strokeStyle = 'rgba(255,205,140,0.5)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(0, 1140, 52, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  ctx.restore();

  // soft warm haze
  glow(540, 1100, 700, 'rgba(255,190,120,0.05)', 1);
  ctx.restore();

  // foreground DOF blur strip
  ctx.save();
  ctx.filter = 'blur(16px)';
  ctx.fillStyle = 'rgba(5,8,12,0.9)';
  ctx.fillRect(-40, 1830, W + 80, 120);
  ctx.restore();
}

function scene1(t) {
  const cross = easeInOutCubic(seg(t, 1.7, 2.7));
  if (cross < 1) { drawStorefront(t); }
  if (cross > 0) {
    ctx.save();
    ctx.globalAlpha = cross;
    drawSalonInterior(t - 1.7);
    ctx.restore();
  }
  grade(); vignette(0.5); grain(t);

  // headline — inside safe zone (y ≈ 1560)
  const tp = win(t, 1.1, 1.9, 3.35, 3.95);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha = tp;
    const spread = lerp(6, 10, easeOutCubic(seg(t, 1.1, 2.6)));
    trackText('A NEW VENTURE.', W/2, 1478, 62, 800, spread, C.white, { glow: 30 });
    trackText('A BIG VISION.',  W/2, 1560, 62, 300, spread, 'rgba(163,230,53,0.95)', { glow: 26, glowColor: 'rgba(163,230,53,0.4)' });
    ctx.restore();
    // thin accent rule
    ctx.save();
    ctx.globalAlpha = tp * 0.8;
    const lw = lerp(0, 220, easeOutCubic(seg(t, 1.4, 2.4)));
    ctx.fillStyle = C.blue;
    ctx.fillRect(W/2 - lw/2, 1604, lw, 3);
    ctx.restore();
  }
}

/* ------------------------------------------------------------
   SCENE 2 — 4..8s  THE DIGITAL CHALLENGE
   Discovery via Instagram DMs; enquiries accumulate.
   ------------------------------------------------------------ */
function phoneFrame(x, y, w, h, r) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, '#2A3442'); g.addColorStop(0.5, '#0C1017'); g.addColorStop(1, '#232C38');
  rr(x, y, w, h, r); ctx.fillStyle = g; ctx.fill();
  ctx.shadowBlur = 0;
  rr(x + 14, y + 14, w - 28, h - 28, r - 12); ctx.fillStyle = '#05070C'; ctx.fill();
  ctx.strokeStyle = 'rgba(140,180,220,0.18)'; ctx.lineWidth = 2;
  rr(x + 14, y + 14, w - 28, h - 28, r - 12); ctx.stroke();
  ctx.restore();
}

function scene2(t) {
  baseBg(t);
  glow(540, 900, 850, 'rgba(24,52,100,0.5)', 1);
  glow(200, 1500, 500, 'rgba(90,60,140,0.12)', 1);

  const inP = easeOutQuint(seg(t, 4.0, 4.7));
  const exit = easeInOutCubic(seg(t, 7.55, 8.0));
  const phW = 560, phH = 1140;
  const px = 540 - phW/2, py = 330 + lerp(60, 0, inP);
  ctx.save();
  ctx.globalAlpha = 1 - exit * 0.35;
  ctx.translate(540, 970);
  ctx.scale(lerp(1, 1.9, exit), lerp(1, 1.9, exit));
  ctx.translate(-540, -970);

  phoneFrame(px, py, phW, phH, 54);
  const sx = px + 14, sy = py + 14, sw = phW - 28, sh = phH - 28;

  ctx.save();
  rr(sx, sy, sw, sh, 42); ctx.clip();

  // app header — social profile (discovery)
  const hg = ctx.createLinearGradient(0, sy, 0, sy + 320);
  hg.addColorStop(0, '#182238'); hg.addColorStop(1, '#0D1422');
  ctx.fillStyle = hg; ctx.fillRect(sx, sy, sw, 320);
  // avatar
  const av = ctx.createLinearGradient(sx+40, sy+60, sx+140, sy+160);
  av.addColorStop(0, C.blueHot); av.addColorStop(1, C.lime);
  ctx.beginPath(); ctx.arc(sx + 92, sy + 108, 48, 0, Math.PI*2);
  ctx.fillStyle = av; ctx.fill();
  ctx.fillStyle = '#0A0F1A'; ctx.font = font(700, 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('L', sx + 92, sy + 110);
  text('lumiere.salon', sx + 162, sy + 96, 32, 700, C.white);
  text('Salon & Spa · Beauty Studio', sx + 162, sy + 134, 24, 400, C.dim);
  button(sx + 40, sy + 190, sw - 80, 66, 33, 'Message', 28, ['rgba(59,130,246,0.95)', 'rgba(56,189,248,0.85)'], '#FFFFFF', 24);

  // chat thread
  const bubbles = [
    { me: 1, s: 4.35, y0: 430, txt: 'Hi! Loved your page — do you have space this Saturday?' },
    { me: 0, s: 4.75, y0: 585, txt: 'Hi there! Let me check for you.' },
    { me: 1, s: 5.15, y0: 690, txt: 'Also, how much is a balayage?' },
    { me: 1, s: 5.55, y0: 800, txt: 'And could I book an appointment?' },
  ];
  ctx.font = font(500, 26);
  bubbles.forEach(b => {
    const bp = win(t, b.s, b.s + 0.45, 99, 99);
    if (bp <= 0) return;
    // wrap first, then size the bubble to the text
    const words = b.txt.split(' ');
    let line = ''; const lines = [];
    words.forEach(w2 => {
      const test = line ? line + ' ' + w2 : w2;
      if (ctx.measureText(test).width > sw - 200 && line) { lines.push(line); line = w2; }
      else line = test;
    });
    lines.push(line);
    const tw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 48;
    const bh = lines.length * 34 + 26;
    const bx = b.me ? sx + sw - 40 - tw : sx + 40; // own messages right-aligned
    const by = sy + b.y0 + (1 - easeOutBack(bp)) * 30;
    ctx.globalAlpha = bp;
    const bg1 = b.me ? 'rgba(41,86,180,0.95)' : 'rgba(38,48,64,0.95)';
    const bg2 = b.me ? 'rgba(56,140,248,0.92)' : 'rgba(28,36,50,0.95)';
    const g = ctx.createLinearGradient(bx, by, bx + tw, by + bh);
    g.addColorStop(0, bg1); g.addColorStop(1, bg2);
    rr(bx, by, tw, bh, 26); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(235,242,250,0.96)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => ctx.fillText(ln, bx + 24, by + 20 + i * 34 + 17));
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = 1;
  });
  // typing indicator at end of thread
  const tip = win(t, 5.95, 5.98, 7.3, 7.6);
  if (tip > 0) {
    ctx.globalAlpha = tip;
    rr(sx + 40, sy + 920, 120, 62, 26); ctx.fillStyle = 'rgba(38,48,64,0.95)'; ctx.fill();
    for (let i = 0; i < 3; i++) {
      const bob = Math.sin(t * 7 + i * 0.9) * 4;
      ctx.beginPath(); ctx.arc(sx + 74 + i * 26, sy + 951 + bob, 6, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(180,200,225,0.7)'; ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore(); // phone screen clip

  // accumulating enquiry pills around the phone
  const pills = [
    { s: 5.9,  y: 330,  side: -1, label: 'Price enquiry' },
    { s: 6.25, y: 1475, side: 1,  label: 'Booking request' },
    { s: 6.6,  y: 700,  side: 1,  label: '“Where are you located?”' },
    { s: 6.95, y: 1460, side: -1, label: 'New DM · Availability' },
    { s: 7.0,  y: 460,  side: -1, label: 'Gift voucher?' },
  ];
  pills.forEach((p, i) => {
    // fade out fully before the exit zoom (7.55s) so pills are never scaled
    const pp = win(t, p.s, p.s + 0.4, 7.4, 7.54);
    if (pp <= 0) return;
    const pop = easeOutBack(pp);
    ctx.font = font(600, 26);
    const pw = ctx.measureText(p.label).width + 84;
    const x = p.side < 0 ? 40 : W - 40 - pw;
    const y = p.y + (1 - pop) * 40 * (i % 2 ? -1 : 1);
    ctx.save();
    ctx.globalAlpha = pp * 0.96;
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30;
    const g = ctx.createLinearGradient(x, y, x, y + 64);
    g.addColorStop(0, 'rgba(36,46,62,0.97)'); g.addColorStop(1, 'rgba(18,24,36,0.97)');
    rr(x, y, pw, 64, 32); ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(140,185,230,0.25)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.shadowBlur = 0;
    // dot
    ctx.beginPath(); ctx.arc(x + 34, y + 32, 9, 0, Math.PI*2);
    ctx.fillStyle = i % 2 ? C.lime : C.blueHot; ctx.fill();
    ctx.fillStyle = 'rgba(232,240,250,0.95)';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = font(600, 26);
    ctx.fillText(p.label, x + 56, y + 33);
    ctx.restore();
  });
  ctx.restore(); // phone transform

  grade(); vignette(0.46); grain(t);

  // headline
  const tp = win(t, 4.6, 5.3, 7.3, 7.65);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha = tp;
    trackText('HOW WILL CUSTOMERS', W/2, 1594, 46, 700, 4, C.white, { glow: 20 });
    trackText('FIND, TRUST AND BOOK YOU?', W/2, 1652, 46, 300, 4, 'rgba(163,230,53,0.95)', { glow: 22, glowColor: 'rgba(163,230,53,0.4)' });
    ctx.restore();
  }
}

/* ------------------------------------------------------------
   SCENE 3 — 8..14s  BUILD A DIGITAL HOME
   Phone screen blooms into the salon's own website, phone + laptop.
   ------------------------------------------------------------ */
function salonSite(ctx2, x, y, w, h, scroll, compact) {
  // page background
  ctx2.fillStyle = '#F7F9FC';
  rr(x, y, w, h, compact ? 30 : 14); ctx2.fill();

  ctx2.save();
  rr(x, y, w, h, compact ? 30 : 14); ctx2.clip();

  const u = w / 900; // scale unit
  const sy0 = y - scroll;

  // nav
  ctx2.fillStyle = '#FFFFFF';
  ctx2.fillRect(x, sy0, w, 78 * u);
  ctx2.fillStyle = '#0B1220';
  ctx2.font = font(800, 30 * u); ctx2.textAlign = 'left'; ctx2.textBaseline = 'middle';
  ctx2.fillText('LUMIÈRE', x + 34 * u, sy0 + 40 * u);
  ctx2.fillStyle = '#7A8899';
  ctx2.font = font(500, 20 * u);
  ['Services', 'Pricing', 'Gallery', 'Visit'].forEach((n, i) => {
    if (!compact) ctx2.fillText(n, x + 420 * u + i * 110 * u, sy0 + 41 * u);
  });
  // hero
  const heroY = sy0 + 78 * u;
  const heroH = (compact ? 380 : 330) * u;
  const hg = ctx2.createLinearGradient(x, heroY, x + w, heroY + heroH);
  hg.addColorStop(0, '#0C1524'); hg.addColorStop(0.55, '#12305E'); hg.addColorStop(1, '#0A3D3A');
  ctx2.fillStyle = hg;
  ctx2.fillRect(x, heroY, w, heroH);
  // elegant hero art: arcs + light
  ctx2.save();
  ctx2.beginPath(); ctx2.rect(x, heroY, w, heroH); ctx2.clip();
  for (let i = 0; i < 4; i++) {
    ctx2.strokeStyle = `rgba(163,230,53,${0.16 - i * 0.03})`;
    ctx2.lineWidth = 2 * u;
    ctx2.beginPath();
    ctx2.arc(x + w * 0.82, heroY + heroH * 0.9, (90 + i * 55) * u, Math.PI * 1.05, Math.PI * 1.95);
    ctx2.stroke();
  }
  glowOn(ctx2, x + w * 0.8, heroY + heroH * 0.75, 240 * u, 'rgba(56,189,248,0.22)');
  glowOn(ctx2, x + w * 0.15, heroY + heroH * 0.2, 200 * u, 'rgba(163,230,53,0.10)');
  ctx2.fillStyle = '#F4F8FD';
  ctx2.font = font(800, (compact ? 52 : 46) * u);
  ctx2.fillText('Effortless beauty,', x + 40 * u, heroY + 120 * u);
  ctx2.fillText('booked in seconds.', x + 40 * u, heroY + 178 * u);
  ctx2.font = font(400, 22 * u);
  ctx2.fillStyle = 'rgba(214,228,242,0.8)';
  ctx2.fillText('Hair · Colour · Skin · Nails', x + 42 * u, heroY + 226 * u);
  // CTA
  const bw = 300 * u, bh = 62 * u, bx = x + 40 * u, by = heroY + 258 * u;
  const bg2 = ctx2.createLinearGradient(bx, by, bx + bw, by + bh);
  bg2.addColorStop(0, '#2F6BEE'); bg2.addColorStop(1, '#38BDF8');
  ctx2.save();
  ctx2.shadowColor = 'rgba(56,140,248,0.6)'; ctx2.shadowBlur = 26 * u;
  rr(bx, by, bw, bh, bh / 2); ctx2.fillStyle = bg2; ctx2.fill();
  ctx2.restore();
  ctx2.fillStyle = '#FFFFFF'; ctx2.font = font(600, 24 * u); ctx2.textAlign = 'center';
  ctx2.fillText('Request an appointment', bx + bw / 2, by + bh / 2 + 1);
  ctx2.textAlign = 'left';
  ctx2.restore();

  // services + pricing
  const svcY = heroY + heroH + 34 * u;
  ctx2.fillStyle = '#0B1220'; ctx2.font = font(700, 26 * u);
  ctx2.fillText('Services & pricing', x + 40 * u, svcY + 26 * u);
  const svcs = [['Signature Cut & Style', '$65'], ['Balayage & Gloss', '$180'], ['Hydra-Glow Facial', '$95'], ['Luxury Manicure', '$55']];
  svcs.forEach((s, i) => {
    const cy = svcY + 52 * u + i * 58 * u;
    if (cy > y + h) return;
    ctx2.fillStyle = '#FFFFFF';
    rr(x + 40 * u, cy, w - 80 * u, 48 * u, 12 * u); ctx2.fill();
    ctx2.strokeStyle = 'rgba(20,40,80,0.08)'; ctx2.lineWidth = 1; ctx2.stroke();
    ctx2.fillStyle = '#1A2434'; ctx2.font = font(500, 22 * u);
    ctx2.fillText(s[0], x + 64 * u, cy + 31 * u);
    ctx2.fillStyle = '#0E7A4E'; ctx2.font = font(700, 22 * u); ctx2.textAlign = 'right';
    ctx2.fillText(s[1], x + w - 64 * u, cy + 31 * u); ctx2.textAlign = 'left';
  });

  // portfolio strip
  const pfY = svcY + 52 * u + 4 * 58 * u + 30 * u;
  ctx2.fillStyle = '#0B1220'; ctx2.font = font(700, 26 * u);
  ctx2.fillText('The portfolio', x + 40 * u, pfY + 24 * u);
  const cols = compact ? 2 : 4, tile = (w - 80 * u - (cols - 1) * 16 * u) / cols;
  for (let i = 0; i < cols; i++) {
    const tx = x + 40 * u + i * (tile + 16 * u), ty = pfY + 44 * u;
    const tg = ctx2.createLinearGradient(tx, ty, tx + tile, ty + tile * 1.15);
    const hues = [['#17304F', '#38BDF8'], ['#20351F', '#A3E635'], ['#3A1F3D', '#C58AF9'], ['#4A2B18', '#FFC98A']][i];
    tg.addColorStop(0, hues[0]); tg.addColorStop(1, hues[1]);
    rr(tx, ty, tile, tile * 1.15, 12 * u); ctx2.fillStyle = tg; ctx2.fill();
  }

  // visit / hours
  const vY = pfY + 44 * u + tile * 1.15 + 34 * u;
  ctx2.fillStyle = '#0B1220';
  rr(x + 40 * u, vY, w - 80 * u, 150 * u, 14 * u); ctx2.fill();
  ctx2.fillStyle = '#F2F6FB';
  rr(x + 56 * u, vY + 16 * u, 118 * u, 118 * u, 10 * u); ctx2.fill();
  ctx2.fillStyle = '#8FA3BC'; ctx2.font = font(600, 17 * u);
  ctx2.fillText('12 Rose Ln', x + 200 * u, vY + 44 * u);
  ctx2.fillStyle = '#F2F6FB'; ctx2.font = font(700, 24 * u);
  ctx2.fillText('Open Tue–Sun · 9:00–19:00', x + 200 * u, vY + 82 * u);
  ctx2.fillStyle = '#A3E635'; ctx2.font = font(600, 21 * u);
  ctx2.fillText('● Open now', x + 200 * u, vY + 118 * u);

  // compact (mobile) only: closing CTA band + footer so the page always
  // fills the phone viewport
  if (compact) {
    const ctaY = vY + 184 * u;
    const cg = ctx2.createLinearGradient(x, ctaY, x + w, ctaY + 190 * u);
    cg.addColorStop(0, '#0C1524'); cg.addColorStop(1, '#0A3D3A');
    rr(x + 40 * u, ctaY, w - 80 * u, 190 * u, 16 * u);
    ctx2.fillStyle = cg; ctx2.fill();
    ctx2.fillStyle = '#F4F8FD'; ctx2.font = font(700, 28 * u);
    ctx2.fillText('Ready when you are.', x + 70 * u, ctaY + 62 * u);
    ctx2.fillStyle = 'rgba(214,228,242,0.8)'; ctx2.font = font(400, 20 * u);
    ctx2.fillText('Requests, confirmations & reminders', x + 70 * u, ctaY + 96 * u);
    const pb = ctx2.createLinearGradient(x + 70 * u, ctaY + 120 * u, x + 330 * u, ctaY + 160 * u);
    pb.addColorStop(0, '#2F6BEE'); pb.addColorStop(1, '#38BDF8');
    rr(x + 70 * u, ctaY + 118 * u, 260 * u, 48 * u, 24 * u);
    ctx2.save();
    ctx2.shadowColor = 'rgba(56,140,248,0.55)'; ctx2.shadowBlur = 18 * u;
    ctx2.fillStyle = pb; ctx2.fill();
    ctx2.restore();
    ctx2.fillStyle = '#FFFFFF'; ctx2.font = font(600, 21 * u); ctx2.textAlign = 'center';
    ctx2.fillText('Book now', x + 200 * u, ctaY + 149 * u);
    ctx2.textAlign = 'left';

    const fY = ctaY + 224 * u;
    ctx2.fillStyle = '#FFFFFF';
    ctx2.fillRect(x, fY, w, 240 * u);
    ctx2.fillStyle = '#0B1220'; ctx2.font = font(800, 26 * u);
    ctx2.fillText('LUMIÈRE', x + 40 * u, fY + 52 * u);
    ctx2.fillStyle = '#7A8899'; ctx2.font = font(500, 18 * u);
    ctx2.fillText('Services · Pricing · Gallery · Visit', x + 40 * u, fY + 92 * u);
    ctx2.fillText('12 Rose Ln · Tue–Sun 9:00–19:00', x + 40 * u, fY + 122 * u);
    ctx2.fillStyle = '#A6B2C2'; ctx2.font = font(400, 16 * u);
    ctx2.fillText('© Lumière Salon & Spa', x + 40 * u, fY + 186 * u);
  }

  ctx2.restore();
}

/* glow helper bound to an arbitrary context */
function glowOn(c, x, y, r, color) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}

function scene3(t) {
  baseBg(t);
  glow(540, 820, 900, 'rgba(26,56,110,0.55)', 1);
  glow(860, 1350, 420, 'rgba(70,140,240,0.16)', 1);

  const inP = easeOutCubic(seg(t, 8.0, 8.9));
  const scroll = easeInOutCubic(seg(t, 9.4, 13.2)) * 620;

  // laptop (behind)
  const lsc = lerp(0.92, 1, inP);
  ctx.save();
  ctx.translate(540, 700);
  ctx.scale(lsc, lsc);
  ctx.translate(-540, -700);
  const lw = 830, lh = 520;
  const lx = 540 - lw / 2, ly = 470;
  // deck
  ctx.fillStyle = '#1A202B';
  rr(lx - 26, ly + lh, lw + 52, 26, 12); ctx.fill();
  ctx.fillStyle = '#0F141D';
  rr(lx - 90, ly + lh + 24, lw + 180, 16, 8); ctx.fill();
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
  const lg = ctx.createLinearGradient(lx, ly, lx, ly + lh);
  lg.addColorStop(0, '#2A3442'); lg.addColorStop(1, '#10151F');
  rr(lx, ly, lw, lh, 22); ctx.fillStyle = lg; ctx.fill();
  ctx.restore();
  // laptop screen
  ctx.save();
  rr(lx + 18, ly + 18, lw - 36, lh - 36, 12); ctx.clip();
  ctx.fillStyle = '#E9EEF5';
  ctx.fillRect(lx + 18, ly + 18, lw - 36, lh - 36);
  ctx.translate(lx + 18, ly + 18);
  ctx.scale((lw - 36) / 900, (lw - 36) / 900);
  salonSite(ctx, 0, 0, 900, (lh - 36) * 900 / (lw - 36), scroll * 0.5, false);
  ctx.restore();
  ctx.strokeStyle = 'rgba(150,185,225,0.2)'; ctx.lineWidth = 2;
  rr(lx + 18, ly + 18, lw - 36, lh - 36, 12); ctx.stroke();
  ctx.restore();

  // phone (front, right, overlapping)
  const psc = lerp(0.8, 1, easeOutBack(inP));
  ctx.save();
  ctx.translate(800, 1140);
  ctx.rotate(-0.05);
  ctx.scale(psc, psc);
  ctx.translate(-800, -1140);
  const pw = 380, ph = 775;
  const px = 800 - pw / 2, py = 1140 - ph / 2;
  phoneFrame(px, py, pw, ph, 44);
  ctx.save();
  rr(px + 12, py + 12, pw - 24, ph - 24, 34); ctx.clip();
  ctx.fillStyle = '#E9EEF5';
  ctx.fillRect(px + 12, py + 12, pw - 24, ph - 24);
  ctx.translate(px + 12, py + 12);
  ctx.scale((pw - 24) / 900, (pw - 24) / 900);
  salonSite(ctx, 0, 0, 900, (ph - 24) * 900 / (pw - 24), scroll * 0.08, true);
  ctx.restore();
  ctx.restore();

  grade(); vignette(0.44); grain(t);

  // headline
  const tp = win(t, 8.7, 9.4, 13.4, 13.95);
  if (tp > 0) {
    ctx.save();
    ctx.globalAlpha = tp;
    trackText('YOUR BUSINESS.', W/2, 1594, 46, 700, 4, C.white, { glow: 20 });
    trackText('YOUR DIGITAL PRESENCE.', W/2, 1652, 46, 300, 4, 'rgba(163,230,53,0.95)', { glow: 22, glowColor: 'rgba(163,230,53,0.4)' });
    ctx.restore();
  }
}
