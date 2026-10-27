// Scene 1 — A new business begins: the salon at night, the interior, then the
// phone that carries the rest of the story.
import { alpha, fillRR, strokeRR, rrPath, linearGradient, radialGradient, glow, drawTracked, smoothstep, easeOutCubic, clamp, lerp, seeded } from '../draw.js';
import { W, H, SALON, MANVEON, FONT } from '../theme.js';
import { drawPhone } from '../phone.js';
import { particleField, deepBackground, stagePolish, bokehField } from '../stage.js';

export function draw(ctx, t) {
  ctx.save();
  deepBackground(ctx, t, { warm: 0.2, blue: 0.35, lime: 0.08 });

  const interiorIn = smoothstep((t - 2.75) / 0.9);
  const exteriorOut = 1 - smoothstep((t - 2.85) / 0.75);
  const heroIn = smoothstep((t - 4.2) / 0.85);

  if (exteriorOut > 0) {
    ctx.save();
    ctx.globalAlpha = exteriorOut;
    exterior(ctx, t);
    ctx.restore();
  }

  if (interiorIn > 0) {
    ctx.save();
    ctx.globalAlpha = interiorIn * (1 - heroIn * 0.85);
    interior(ctx, t);
    ctx.restore();
  }

  particleField(ctx, {
    time: t,
    count: 46,
    seed: 5,
    color: '#F2D9B4',
    opacity: 0.28,
    speed: 12,
    size: 2.2
  });

  if (heroIn > 0) heroPhone(ctx, t, heroIn);

  stagePolish(ctx, t, { vignetteStrength: 0.85, bloom: 0.3, bloomColor: MANVEON.blue });
  ctx.restore();
}

// ---- Exterior ------------------------------------------------------------

function exterior(ctx, t) {
  const push = easeOutCubic(clamp(t / 3.4));
  const scale = lerp(1.0, 1.07, push);

  ctx.save();
  ctx.translate(W / 2, H * 0.5);
  ctx.scale(scale, scale);
  ctx.translate(-W / 2, -H * 0.5);
  ctx.translate(0, -push * 22);

  // Night sky.
  ctx.fillStyle = linearGradient(ctx, 0, 0, 0, 700, [
    [0, '#02050A'],
    [0.55, '#050A11'],
    [1, '#0A1018']
  ]);
  ctx.fillRect(0, 0, W, H);

  // City beyond the shop.
  drawCity(ctx, t);

  // Facade.
  const facade = { x: 54, y: 296, w: 972, h: 1000 };
  fillRR(ctx, facade.x, facade.y, facade.w, facade.h, 4, linearGradient(ctx, 0, facade.y, 0, facade.y + facade.h, [
    [0, '#241B14'],
    [0.4, '#17110C'],
    [1, '#0B0806']
  ]));

  // Stone grain: faint horizontal joints and vertical pilasters.
  ctx.save();
  ctx.strokeStyle = 'rgba(255,240,220,0.035)';
  ctx.lineWidth = 1.5;
  for (let y = facade.y + 46; y < facade.y + facade.h; y += 96) {
    ctx.beginPath();
    ctx.moveTo(facade.x + 8, y);
    ctx.lineTo(facade.x + facade.w - 8, y);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(facade.x, facade.y, 26, facade.h);
  ctx.fillRect(facade.x + facade.w - 26, facade.y, 26, facade.h);
  ctx.restore();

  // Cornice and roofline.
  fillRR(ctx, facade.x - 12, facade.y - 22, facade.w + 24, 26, 3, '#1B1510');
  ctx.fillStyle = 'rgba(255,226,190,0.18)';
  ctx.fillRect(facade.x - 12, facade.y - 22, facade.w + 24, 2);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(facade.x - 4, facade.y + 4, facade.w + 8, 10);

  // Upper floor windows.
  [150, 380, 610, 840].forEach((x, index) => {
    const y = 360;
    fillRR(ctx, x, y, 150, 112, 3, '#07090C');
    ctx.save();
    rrPath(ctx, x, y, 150, 112, 3);
    ctx.clip();
    ctx.fillStyle = linearGradient(ctx, x, y, x + 150, y + 112, [
      [0, 'rgba(70,100,140,0.16)'],
      [0.45, 'rgba(20,30,44,0.05)'],
      [1, 'rgba(3,5,8,0.4)']
    ]);
    ctx.fillRect(x, y, 150, 112);
    if (index === 2) {
      // One room still lit.
      ctx.fillStyle = 'rgba(255,206,150,0.16)';
      ctx.fillRect(x + 6, y + 6, 138, 100);
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(201,169,107,0.25)';
    ctx.lineWidth = 1.2;
    rrPath(ctx, x, y, 150, 112, 3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(201,169,107,0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + 56);
    ctx.lineTo(x + 150, y + 56);
    ctx.moveTo(x + 75, y);
    ctx.lineTo(x + 75, y + 112);
    ctx.stroke();
  });

  // Sign.
  const signY = 508;
  fillRR(ctx, 96, signY, 888, 112, 2, '#080605');
  ctx.save();
  ctx.strokeStyle = linearGradient(ctx, 96, signY, 984, signY + 112, [
    [0, 'rgba(201,169,107,0.15)'],
    [0.5, 'rgba(201,169,107,0.7)'],
    [1, 'rgba(201,169,107,0.15)']
  ]);
  ctx.lineWidth = 1.6;
  rrPath(ctx, 96, signY, 888, 112, 2);
  ctx.stroke();
  ctx.restore();
  glow(ctx, W / 2, signY + 62, 330, '#E8C68E', 0.42);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F7EFE0';
  ctx.font = `400 60px ${FONT.serif}`;
  ctx.fillText('LUXE STUDIO', W / 2, signY + 64);
  ctx.fillStyle = alpha(SALON.champagne, 0.9);
  ctx.font = `600 16px ${FONT.semi}`;
  drawTracked(ctx, 'BEAUTY & SALON', W / 2, signY + 94, 6, 'center');
  ctx.textAlign = 'left';

  // Sconces flanking the sign.
  [118, 962].forEach((x) => {
    glow(ctx, x, signY + 56, 110, '#FFD8A2', 0.7);
    fillRR(ctx, x - 5, signY + 38, 10, 38, 4, '#2A2118');
    ctx.fillStyle = '#FFE9C6';
    ctx.beginPath();
    ctx.arc(x, signY + 36, 7, 0, Math.PI * 2);
    ctx.fill();
    // Wall wash.
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = radialGradient(ctx, x, signY + 60, 0, 120, [
      [0, 'rgba(255,208,150,0.18)'],
      [1, 'rgba(255,208,150,0)']
    ]);
    ctx.fillRect(x - 120, signY, 240, 300);
    ctx.restore();
  });

  // Window.
  const win = { x: 110, y: 658, w: 582, h: 540 };
  drawWindow(ctx, t, win);

  // Door.
  drawDoor(ctx, { x: 730, y: 668, w: 240, h: 530 }, t);

  // Sill and step.
  fillRR(ctx, win.x - 10, win.y + win.h, win.w + 20, 12, 2, '#2B2118');
  ctx.fillStyle = 'rgba(255,226,190,0.2)';
  ctx.fillRect(win.x - 10, win.y + win.h, win.w + 20, 2);
  fillRR(ctx, 60, 1236, 960, 16, 2, '#1A1511');

  // Warm light spilling onto the pavement.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = linearGradient(ctx, 0, 1236, 0, 1560, [
    [0, 'rgba(255,203,142,0.3)'],
    [0.45, 'rgba(255,190,125,0.12)'],
    [1, 'rgba(255,190,125,0)']
  ]);
  ctx.beginPath();
  ctx.moveTo(96, 1236);
  ctx.lineTo(990, 1236);
  ctx.lineTo(1070, 1560);
  ctx.lineTo(40, 1560);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  drawPavement(ctx, t);
  drawForeground(ctx, t);

  ctx.restore();
}

function drawCity(ctx, t) {
  // Distant towers with sparse lit windows.
  const randCity = seeded(771);
  for (let i = 0; i < 7; i += 1) {
    const w = 120 + randCity() * 120;
    const h = 120 + randCity() * 230;
    const x = -40 + i * 170 + randCity() * 40;
    const y = 300 - h;
    ctx.fillStyle = i % 2 ? '#04070C' : '#060A10';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(210,178,130,0.16)';
    for (let k = 0; k < 8; k += 1) {
      const wx = x + 14 + (k % 3) * 34;
      const wy = y + 22 + Math.floor(k / 3) * 40;
      if (wx + 12 < x + w && wy + 14 < 300) ctx.fillRect(wx, wy, 12, 16);
    }
  }
  // Street bokeh.
  bokehField(ctx, {
    time: t,
    count: 8,
    seed: 21,
    colors: ['#E7B978', '#8FB6FF'],
    area: { x: 0, y: 180, w: W, h: 420 },
    strength: 0.42,
    size: 110
  });
}

function drawWindow(ctx, t, win) {
  // Recess.
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(win.x - 14, win.y - 14, win.w + 28, win.h + 28);

  // Interior seen through the glass.
  ctx.save();
  rrPath(ctx, win.x, win.y, win.w, win.h, 2);
  ctx.clip();

  ctx.fillStyle = linearGradient(ctx, 0, win.y, 0, win.y + win.h, [
    [0, '#8C6238'],
    [0.28, '#C99B67'],
    [0.55, '#B98A5C'],
    [1, '#5E4026']
  ]);
  ctx.fillRect(win.x, win.y, win.w, win.h);
  // Warm pools of light on the back wall.
  [0.22, 0.5, 0.78].forEach((p) => {
    ctx.fillStyle = radialGradient(ctx, win.x + win.w * p, win.y + 240, 0, 190, [
      [0, 'rgba(255,226,178,0.4)'],
      [1, 'rgba(255,226,178,0)']
    ]);
    ctx.fillRect(win.x, win.y, win.w, win.h);
  });
  // Floor.
  ctx.fillStyle = linearGradient(ctx, 0, win.y + win.h - 150, 0, win.y + win.h, [
    [0, 'rgba(60,38,20,0)'],
    [1, 'rgba(40,24,12,0.55)']
  ]);
  ctx.fillRect(win.x, win.y + win.h - 150, win.w, 150);

  // Ceiling and pendant lamps.
  ctx.fillStyle = 'rgba(60,40,24,0.6)';
  ctx.fillRect(win.x, win.y, win.w, 56);
  [0.22, 0.5, 0.78].forEach((p) => {
    const lx = win.x + win.w * p;
    const ly = win.y + 84;
    ctx.strokeStyle = 'rgba(40,26,14,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(lx, win.y);
    ctx.lineTo(lx, ly - 12);
    ctx.stroke();
    glow(ctx, lx, ly, 78, '#FFDCA8', 0.85);
    ctx.fillStyle = '#FFF1D8';
    ctx.beginPath();
    ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Mirrors and styling stations.
  [0.18, 0.5, 0.82].forEach((p, index) => {
    const mx = win.x + win.w * p;
    const mw = 122;
    const mh = 236;
    const my = win.y + 128;
    fillRR(ctx, mx - mw / 2 - 5, my - 5, mw + 10, mh + 10, 6, '#8B6A3F');
    fillRR(ctx, mx - mw / 2, my, mw, mh, 3, linearGradient(ctx, mx, my, mx + mw, my + mh, [
      [0, '#57432F'],
      [0.45, '#2C2118'],
      [0.7, '#3A2C20'],
      [1, '#191009']
    ]));
    // Reflection of the room in the mirror.
    ctx.save();
    rrPath(ctx, mx - mw / 2, my, mw, mh, 3);
    ctx.clip();
    ctx.fillStyle = linearGradient(ctx, mx - mw / 2, my, mx + mw / 2, my + mh, [
      [0, 'rgba(255,225,180,0.4)'],
      [0.5, 'rgba(255,225,180,0.04)'],
      [1, 'rgba(20,12,7,0.4)']
    ]);
    ctx.fillRect(mx - mw / 2, my, mw, mh);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(mx, my + mh - 26, 44, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bulbs.
    for (let i = 0; i < 7; i += 1) {
      const bx = mx - mw / 2 + 10 + i * ((mw - 20) / 6);
      glow(ctx, bx, my - 4, 26, '#FFE3B4', 0.8);
      ctx.fillStyle = '#FFF4E0';
      ctx.beginPath();
      ctx.arc(bx, my - 4, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Counter: dark wood with a brass edge and a soft reflection.
    fillRR(ctx, mx - 100, win.y + 386, 200, 6, 2, 'rgba(201,169,107,0.75)');
    fillRR(ctx, mx - 94, win.y + 392, 188, 86, 2, 'rgba(34,22,13,0.88)');
    ctx.fillStyle = linearGradient(ctx, mx - 94, win.y + 392, mx + 94, win.y + 440, [
      [0, 'rgba(255,224,180,0.16)'],
      [1, 'rgba(255,224,180,0)']
    ]);
    ctx.fillRect(mx - 94, win.y + 392, 188, 40);

    // Styling chair with legs and a rim light.
    const cy = win.y + 470;
    fillRR(ctx, mx - 34, cy, 68, 42, 12, '#120C08');
    fillRR(ctx, mx - 44, cy + 30, 88, 22, 9, '#0B0705');
    fillRR(ctx, mx - 4, cy + 50, 8, 66, 3, '#2C2A2C');
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(mx, cy + 118, 34, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,175,0.22)';
    ctx.lineWidth = 1.6;
    rrPath(ctx, mx - 34, cy, 68, 42, 12);
    ctx.stroke();
    if (index === 0) {
      // Product shelf on the left.
      [0, 1, 2].forEach((row) => {
        const sy = win.y + 150 + row * 56;
        fillRR(ctx, mx - 142, sy, 62, 4, 2, 'rgba(45,30,18,0.6)');
        for (let b = 0; b < 3; b += 1) {
          const bx = mx - 136 + b * 20;
          const bh = 16 + ((row + b) % 3) * 6;
          fillRR(ctx, bx, sy - bh, 11, bh, 2, 'rgba(255,236,210,0.75)');
          fillRR(ctx, bx, sy - bh, 11, 4, 2, 'rgba(201,169,107,0.9)');
        }
      });
    }
  });

  // Etched wordmark on the glass.
  ctx.fillStyle = 'rgba(255,245,228,0.16)';
  ctx.font = `400 15px ${FONT.serif}`;
  ctx.textAlign = 'center';
  drawTracked(ctx, 'LUXE STUDIO', win.x + win.w / 2, win.y + win.h - 18, 5, 'center');
  ctx.textAlign = 'left';

  // Glass reflections: diagonal sheen, cool streaks and street bokeh.
  ctx.fillStyle = linearGradient(ctx, win.x, win.y, win.x + win.w * 0.7, win.y + win.h, [
    [0, 'rgba(255,255,255,0.2)'],
    [0.35, 'rgba(255,255,255,0.04)'],
    [1, 'rgba(255,255,255,0)']
  ]);
  ctx.beginPath();
  ctx.moveTo(win.x, win.y);
  ctx.lineTo(win.x + win.w * 0.42, win.y);
  ctx.lineTo(win.x + win.w * 0.05, win.y + win.h);
  ctx.lineTo(win.x, win.y + win.h);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i += 1) {
    const x = win.x + 40 + i * 110;
    ctx.fillStyle = radialGradient(ctx, x, win.y + 40 + i * 22, 0, 60, [
      [0, 'rgba(150,190,255,0.16)'],
      [1, 'rgba(150,190,255,0)']
    ]);
    ctx.beginPath();
    ctx.arc(x, win.y + 40 + i * 22, 60, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();

  // Brass frame.
  ctx.save();
  ctx.strokeStyle = linearGradient(ctx, win.x, win.y, win.x + win.w, win.y + win.h, [
    [0, '#B79055'],
    [0.5, '#6E4F29'],
    [1, '#D8B77C']
  ]);
  ctx.lineWidth = 9;
  rrPath(ctx, win.x, win.y, win.w, win.h, 2);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(win.x + win.w * 0.5, win.y + 4);
  ctx.lineTo(win.x + win.w * 0.5, win.y + win.h - 4);
  ctx.stroke();
  ctx.restore();
  // Inner shadow at the top of the recess.
  ctx.save();
  ctx.fillStyle = linearGradient(ctx, 0, win.y, 0, win.y + 40, [
    [0, 'rgba(0,0,0,0.55)'],
    [1, 'rgba(0,0,0,0)']
  ]);
  ctx.fillRect(win.x, win.y, win.w, 40);
  ctx.restore();
  ctx.restore();
}

function drawDoor(ctx, door, t) {
  // Recessed glass door with a brass frame.
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(door.x - 12, door.y - 10, door.w + 24, door.h + 20);

  // Interior behind the door.
  ctx.save();
  rrPath(ctx, door.x, door.y, door.w, door.h, 2);
  ctx.clip();
  ctx.fillStyle = linearGradient(ctx, 0, door.y, 0, door.y + door.h, [
    [0, '#C79C6A'],
    [0.35, '#B0855A'],
    [1, '#5A3D22']
  ]);
  ctx.fillRect(door.x, door.y, door.w, door.h);
  // Wall panelling and a lit reception desk.
  ctx.strokeStyle = 'rgba(45,28,15,0.25)';
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(door.x + i * 58, door.y + 40);
    ctx.lineTo(door.x + i * 58, door.y + 300);
    ctx.stroke();
  }
  fillRR(ctx, door.x + 18, door.y + 300, 196, 8, 2, 'rgba(201,169,107,0.5)');
  fillRR(ctx, door.x + 26, door.y + 308, 180, 210, 2, 'rgba(32,20,12,0.55)');
  ctx.fillStyle = linearGradient(ctx, door.x + 26, door.y + 308, door.x + 206, door.y + 380, [
    [0, 'rgba(255,224,180,0.14)'],
    [1, 'rgba(255,224,180,0)']
  ]);
  ctx.fillRect(door.x + 26, door.y + 308, 180, 70);
  glow(ctx, door.x + 168, door.y + 132, 78, '#FFE2B4', 0.75);
  ctx.fillStyle = '#FFF0D6';
  ctx.beginPath();
  ctx.arc(door.x + 190, door.y + 120, 7, 0, Math.PI * 2);
  ctx.fill();
  // Reflection.
  ctx.fillStyle = linearGradient(ctx, door.x, door.y, door.x + door.w, door.y + door.h, [
    [0, 'rgba(255,255,255,0.22)'],
    [0.4, 'rgba(255,255,255,0.03)'],
    [1, 'rgba(255,255,255,0.1)']
  ]);
  ctx.beginPath();
  ctx.moveTo(door.x, door.y);
  ctx.lineTo(door.x + door.w * 0.55, door.y);
  ctx.lineTo(door.x + door.w * 0.1, door.y + door.h);
  ctx.lineTo(door.x, door.y + door.h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Frame and handle.
  ctx.strokeStyle = '#9A7A48';
  ctx.lineWidth = 8;
  ctx.strokeRect(door.x, door.y, door.w, door.h);
  fillRR(ctx, door.x + 26, door.y + 250, 6, 104, 3, '#C9A96B');
  ctx.fillStyle = 'rgba(255,238,205,0.5)';
  ctx.font = `600 8px ${FONT.semi}`;
  ctx.textAlign = 'center';
  drawTracked(ctx, 'PULL', door.x + door.w - 46, door.y + 190, 2.4, 'center');
  ctx.textAlign = 'left';
  ctx.restore();

  // NOW OPEN plaque on the wall above the door.
  fillRR(ctx, 792, 628, 148, 34, 5, 'rgba(10,8,6,0.85)');
  strokeRR(ctx, 792, 628, 148, 34, 5, alpha(SALON.champagne, 0.5), 1);
  ctx.fillStyle = SALON.champagneSoft;
  ctx.font = `600 10px ${FONT.semi}`;
  drawTracked(ctx, 'NOW OPEN', 866, 650, 3, 'center');
}

function drawPavement(ctx, t) {
  ctx.fillStyle = linearGradient(ctx, 0, 1250, 0, H, [
    [0, '#101418'],
    [0.2, '#0A0D11'],
    [1, '#030507']
  ]);
  ctx.fillRect(0, 1250, W, H - 1250);

  // Curb.
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(0, 1250, W, 3);

  // Long wet reflections of the window and sign.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const reflect = (x, w, color, strength) => {
    const g = ctx.createLinearGradient(x, 1252, x + w * 0.3, 1640);
    g.addColorStop(0, alpha(color, strength));
    g.addColorStop(1, alpha(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, 1252);
    ctx.lineTo(x + w, 1252);
    ctx.lineTo(x + w + 60, 1640);
    ctx.lineTo(x - 30, 1640);
    ctx.closePath();
    ctx.fill();
  };
  reflect(120, 560, '#FFC98A', 0.3);
  reflect(735, 230, '#FFC98A', 0.36);
  reflect(320, 120, '#9CC8FF', 0.14);
  // Reflected shop sign.
  ctx.fillStyle = linearGradient(ctx, 0, 1252, 0, 1500, [
    [0, 'rgba(255,222,170,0.2)'],
    [1, 'rgba(255,222,170,0)']
  ]);
  ctx.beginPath();
  ctx.moveTo(180, 1252);
  ctx.lineTo(900, 1252);
  ctx.lineTo(960, 1500);
  ctx.lineTo(120, 1500);
  ctx.closePath();
  ctx.fill();

  // Broken reflection streaks.
  const randP = seeded(515);
  for (let i = 0; i < 16; i += 1) {
    const y = 1270 + i * 34 + randP() * 10;
    const x = 80 + randP() * 780;
    const w = 60 + randP() * 240;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(150,190,255,0.1)' : 'rgba(255,205,150,0.14)';
    ctx.lineWidth = 1 + randP() * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + 3);
    ctx.stroke();
  }
  ctx.restore();
}

function drawForeground(ctx, t) {
  // Out-of-focus plant at the lower left to frame the shot.
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#04070A';
  ctx.beginPath();
  ctx.ellipse(-30, 1810, 240, 210, -0.2, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 7; i += 1) {
    const angle = -1.9 + i * 0.3;
    const cx = -10 + Math.cos(angle) * 60;
    const cy = 1700 + Math.sin(angle) * 90;
    ctx.fillStyle = i % 2 ? '#061014' : '#040A0D';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 26, 82, angle, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Warm bloom from the street.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = radialGradient(ctx, 1020, 1450, 0, 300, [
    [0, 'rgba(255,180,110,0.16)'],
    [1, 'rgba(255,180,110,0)']
  ]);
  ctx.fillRect(700, 1150, 380, 600);
  ctx.restore();
}

// ---- Interior ------------------------------------------------------------

function interior(ctx, t) {
  const pan = easeOutCubic(clamp((t - 2.6) / 1.7));
  ctx.save();
  ctx.translate(lerp(-34, 40, pan), 0);

  // Room.
  ctx.fillStyle = linearGradient(ctx, 0, 0, 0, H, [
    [0, '#241811'],
    [0.45, '#150E09'],
    [1, '#080605']
  ]);
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = radialGradient(ctx, W * 0.5, H * 0.32, 0, W * 0.85, [
    [0, 'rgba(255,210,155,0.28)'],
    [0.5, 'rgba(220,160,100,0.09)'],
    [1, 'rgba(0,0,0,0)']
  ]);
  ctx.fillRect(0, 0, W, H);

  // Ceiling and spotlights.
  ctx.fillStyle = 'rgba(10,7,5,0.9)';
  ctx.fillRect(0, 0, W, 190);
  [230, 540, 860].forEach((x, index) => {
    glow(ctx, x, 206, 120, '#FFD9A6', 0.55);
    ctx.fillStyle = '#FFE9C8';
    ctx.beginPath();
    ctx.arc(x, 206, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = linearGradient(ctx, 0, 206, 0, 1030, [
      [0, 'rgba(255,214,160,0.14)'],
      [1, 'rgba(255,214,160,0)']
    ]);
    ctx.beginPath();
    ctx.moveTo(x - 22, 210);
    ctx.lineTo(x + 22, 210);
    ctx.lineTo(x + 230, 1010);
    ctx.lineTo(x - 230, 1010);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // Wall panelling.
  ctx.strokeStyle = 'rgba(255,240,220,0.05)';
  ctx.lineWidth = 2;
  for (let x = 80; x < W; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x, 190);
    ctx.lineTo(x, 1080);
    ctx.stroke();
  }

  // Mirrors and stations.
  [210, 490, 770].forEach((x, index) => {
    const y = 372;
    const w = 220;
    const h = 400;
    fillRR(ctx, x - w / 2 - 6, y - 6, w + 12, h + 12, 10, linearGradient(ctx, x, y, x, y + h, [
      [0, '#D2B078'],
      [0.5, '#7A5C33'],
      [1, '#3E2E19']
    ]));
    fillRR(ctx, x - w / 2, y, w, h, 5, linearGradient(ctx, x, y, x + w, y + h, [
      [0, '#3B2F24'],
      [0.45, '#1C1510'],
      [1, '#0F0B08']
    ]));

    // Reflected warm light and room shapes.
    ctx.save();
    rrPath(ctx, x - w / 2, y, w, h, 5);
    ctx.clip();
    ctx.fillStyle = linearGradient(ctx, x - w / 2, y, x + w / 2, y + h, [
      [0, 'rgba(255,228,185,0.26)'],
      [0.45, 'rgba(255,228,185,0.02)'],
      [1, 'rgba(255,228,185,0.12)']
    ]);
    ctx.fillRect(x - w / 2, y, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.74, 82, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Bulbs.
    for (let i = 0; i < 9; i += 1) {
      const bx = x - w / 2 + 16 + i * ((w - 32) / 8);
      glow(ctx, bx, y - 2, 32, '#FFE2B4', 0.8);
      ctx.fillStyle = '#FFF3DC';
      ctx.beginPath();
      ctx.arc(bx, y - 2, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Counter.
    fillRR(ctx, x - 132, 826, 264, 12, 3, 'rgba(212,178,124,0.65)');
    fillRR(ctx, x - 124, 838, 248, 96, 3, 'rgba(35,24,16,0.75)');
    // Reflection on the counter.
    ctx.fillStyle = linearGradient(ctx, x - 124, 838, x + 124, 934, [
      [0, 'rgba(255,222,175,0.16)'],
      [1, 'rgba(255,222,175,0)']
    ]);
    ctx.fillRect(x - 124, 838, 248, 40);

    // Styling chair silhouette with rim light.
    const cy = 940;
    ctx.fillStyle = '#0C0907';
    fillRR(ctx, x - 56, cy, 112, 112, 30, '#140E0A');
    fillRR(ctx, x - 74, cy + 66, 148, 44, 22, '#0B0806');
    fillRR(ctx, x - 7, cy + 110, 14, 92, 6, '#26262A');
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(x, cy + 208, 58, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,214,160,0.22)';
    ctx.lineWidth = 2;
    rrPath(ctx, x - 56, cy, 112, 112, 30);
    ctx.stroke();

    if (index === 0) {
      // Product shelf.
      [0, 1, 2].forEach((row) => {
        const sy = 520 + row * 70;
        fillRR(ctx, x - 170, sy, 96, 5, 2, 'rgba(201,169,107,0.35)');
        for (let b = 0; b < 3; b += 1) {
          const bx = x - 160 + b * 30;
          const bh = 24 + ((row + b) % 3) * 7;
          fillRR(ctx, bx, sy - bh, 16, bh, 3, 'rgba(240,225,205,0.6)');
          fillRR(ctx, bx, sy - bh, 16, 6, 3, 'rgba(201,169,107,0.7)');
        }
      });
    }
  });

  // Marble floor with reflections.
  ctx.fillStyle = linearGradient(ctx, 0, 1080, 0, H, [
    [0, '#241A12'],
    [0.5, '#100B08'],
    [1, '#060403']
  ]);
  ctx.fillRect(0, 1080, W, H - 1080);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = linearGradient(ctx, 0, 1090, 0, H, [
    [0, 'rgba(255,220,170,0.12)'],
    [1, 'rgba(255,220,170,0)']
  ]);
  ctx.fillRect(0, 1090, W, H - 1090);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.2;
  for (let i = 0; i < 9; i += 1) {
    ctx.strokeStyle = 'rgba(255,214,160,0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80 + i * 120, 1090);
    ctx.lineTo(-220 + i * 230, H);
    ctx.stroke();
  }
  ctx.restore();

  founder(ctx, t);

  bokehField(ctx, {
    time: t,
    count: 7,
    seed: 33,
    colors: ['#FFD8A0', '#C9A96B'],
    area: { x: 0, y: 300, w: W, h: 900 },
    strength: 0.35,
    size: 60
  });

  ctx.restore();
}

function founder(ctx, t) {
  const bob = Math.sin(t * 1.1) * 4;
  ctx.save();
  ctx.translate(0, bob);

  ctx.fillStyle = '#070505';
  ctx.beginPath();
  ctx.moveTo(700, 1920);
  ctx.lineTo(748, 1100);
  ctx.bezierCurveTo(760, 1010, 830, 966, 872, 936);
  ctx.bezierCurveTo(876, 946, 898, 946, 898, 926);
  ctx.bezierCurveTo(900, 884, 940, 864, 984, 870);
  ctx.lineTo(1080, 884);
  ctx.lineTo(1080, 1920);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(908, 724, 66, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(820, 906);
  ctx.bezierCurveTo(830, 806, 872, 786, 908, 786);
  ctx.bezierCurveTo(954, 786, 994, 816, 1004, 906);
  ctx.lineTo(1014, 1010);
  ctx.lineTo(820, 1010);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(908, 704, 70, Math.PI * 1.05, Math.PI * 2.05);
  ctx.fill();

  // Rim light.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(255,205,150,0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(908, 724, 67, Math.PI * 1.15, Math.PI * 1.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(832, 906);
  ctx.bezierCurveTo(842, 826, 870, 798, 902, 792);
  ctx.stroke();
  ctx.restore();

  // Phone in hand.
  const px = 874;
  const py = 910;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-0.18);
  glow(ctx, 0, 0, 150, '#F6E7CC', 0.6);
  fillRR(ctx, -30, -62, 60, 124, 12, '#050608');
  fillRR(ctx, -25, -56, 50, 110, 8, '#F3E6D2');
  ctx.fillStyle = alpha(SALON.champagne, 0.9);
  ctx.font = `400 15px ${FONT.serif}`;
  ctx.textAlign = 'center';
  ctx.fillText('LS', 0, -2);
  ctx.fillStyle = 'rgba(21,18,15,0.8)';
  ctx.font = `600 4px ${FONT.semi}`;
  drawTracked(ctx, 'LUXE STUDIO', 0, 8, 1.2, 'center');
  ctx.textAlign = 'left';
  ctx.restore();

  ctx.restore();

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(930, 1500, 200, 40, 0, 0, Math.PI * 2);
  ctx.fill();
}

function heroPhone(ctx, t, amount) {
  const ease = easeOutCubic(amount);
  const scale = lerp(0.34, 1.06, ease) * (1 + clamp((t - 5.15) / 0.5) * 0.1);
  const cx = lerp(874, W / 2, ease);
  const cy = 905;
  const rotation = lerp(-0.18, -0.03, ease);

  ctx.fillStyle = `rgba(3,6,10,${0.35 * amount})`;
  ctx.fillRect(0, 0, W, H);

  drawPhone(ctx, {
    cx,
    cy,
    scale,
    rotation,
    glowColor: MANVEON.blue,
    glowStrength: 0.5 + amount * 0.4,
    screen: (c) => splashScreen(c, t)
  });
}

function splashScreen(ctx, t) {
  // A dark, premium splash rather than a blank white screen.
  ctx.fillStyle = '#0E0B09';
  ctx.fillRect(0, 0, 390, 850);
  ctx.fillStyle = radialGradient(ctx, 195, 360, 0, 330, [
    [0, 'rgba(201,169,107,0.24)'],
    [0.55, 'rgba(201,169,107,0.06)'],
    [1, 'rgba(201,169,107,0)']
  ]);
  ctx.fillRect(0, 0, 390, 850);

  ctx.save();
  ctx.strokeStyle = alpha(SALON.champagne, 0.55);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(195, 360, 58, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = SALON.champagneSoft;
  ctx.font = `400 52px ${FONT.serif}`;
  ctx.textAlign = 'center';
  ctx.fillText('LS', 195, 380);
  ctx.fillStyle = '#F6EEDF';
  ctx.font = `400 26px ${FONT.serif}`;
  drawTracked(ctx, 'LUXE STUDIO', 195, 470, 3, 'center');
  ctx.fillStyle = 'rgba(255,247,234,0.45)';
  ctx.font = `600 7px ${FONT.semi}`;
  drawTracked(ctx, 'BEAUTY & SALON', 195, 492, 3.4, 'center');

  fillRR(ctx, 145, 560, 100, 34, 17, 'rgba(251,246,238,0.1)');
  strokeRR(ctx, 145, 560, 100, 34, 17, 'rgba(201,169,107,0.4)', 1);
  ctx.fillStyle = SALON.champagneSoft;
  ctx.font = `500 9px ${FONT.medium}`;
  ctx.fillText('Explore Services', 195, 581);
  ctx.textAlign = 'left';

  const p = smoothstep((t - 4.7) / 0.9);
  fillRR(ctx, 130, 660, 130, 2, 1, 'rgba(255,255,255,0.08)');
  fillRR(ctx, 130, 660, 130 * p, 2, 1, alpha(SALON.champagne, 0.9));
  ctx.save();
  ctx.globalAlpha = 0.5;
  fillRR(ctx, 130, 690, 130, 1, 0.5, 'rgba(255,255,255,0.12)');
  ctx.restore();
}
