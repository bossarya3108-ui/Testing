// The appointment request flow and its confirmation screen.
import { alpha, fillRR, strokeRR, rrPath, radialGradient, drawTracked, measureTracked, clamp } from '../draw.js';
import { SALON, FONT, MANVEON } from '../theme.js';
import { STUDIO, money } from '../content.js';
import { UI_W, UI_H, statusBar, icon, divider, caret, stickyBar } from './primitives.js';

const B = STUDIO.booking;

function bookingHeader(ctx, step) {
  ctx.save();
  ctx.fillStyle = SALON.ivoryWarm;
  ctx.fillRect(0, 0, UI_W, 96);
  statusBar(ctx, { dark: false, time: '9:44' });
  icon(ctx, 'back', 24, 66, 17, SALON.black, 1.6);
  ctx.fillStyle = SALON.black;
  ctx.font = `600 12px ${FONT.semi}`;
  ctx.textAlign = 'center';
  drawTracked(ctx, 'BOOK AN APPOINTMENT', UI_W / 2, 68, 1.8, 'center');
  ctx.textAlign = 'left';
  ctx.fillStyle = SALON.taupe;
  ctx.font = `500 8px ${FONT.semi}`;
  ctx.textAlign = 'right';
  ctx.fillText(`${step + 1} / 5`, UI_W - 24, 68);
  ctx.textAlign = 'left';

  // Stepper.
  const startX = 24;
  const width = UI_W - 48;
  const gap = width / (B.steps.length - 1);
  ctx.strokeStyle = 'rgba(21,18,15,0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, 100);
  ctx.lineTo(startX + width, 100);
  ctx.stroke();
  ctx.strokeStyle = SALON.champagne;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, 100);
  ctx.lineTo(startX + gap * step, 100);
  ctx.stroke();
  B.steps.forEach((label, index) => {
    const x = startX + gap * index;
    ctx.beginPath();
    ctx.fillStyle = index <= step ? SALON.black : 'rgba(21,18,15,0.2)';
    ctx.arc(x, 100, index === step ? 4 : 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = index === step ? SALON.black : SALON.taupe;
    ctx.font = `${index === step ? 600 : 400} 7.5px ${index === step ? FONT.semi : FONT.sans}`;
    ctx.textAlign = index === 0 ? 'left' : index === B.steps.length - 1 ? 'right' : 'center';
    ctx.fillText(label.toUpperCase(), x, 118);
  });
  ctx.textAlign = 'left';
  ctx.restore();
}

function stepTitle(ctx, title, subtitle) {
  ctx.save();
  ctx.fillStyle = SALON.black;
  ctx.font = `400 24px ${FONT.serif}`;
  ctx.fillText(title, 22, 166);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `400 10px ${FONT.sans}`;
  ctx.fillText(subtitle, 22, 184);
  ctx.restore();
}

function optionCard(ctx, x, y, w, h, opts) {
  const { title, sub, meta, selected = false, pressed = false } = opts;
  ctx.save();
  if (selected) {
    fillRR(ctx, x, y, w, h, 12, '#FFFFFF');
    strokeRR(ctx, x, y, w, h, 12, alpha(SALON.champagne, 0.95), 1.4);
    fillRR(ctx, x, y, 3, h, 2, SALON.champagne);
  } else {
    fillRR(ctx, x, y, w, h, 12, 'rgba(255,255,255,0.55)');
    strokeRR(ctx, x, y, w, h, 12, SALON.line, 1);
  }
  ctx.fillStyle = SALON.black;
  ctx.font = `500 12.5px ${FONT.semi}`;
  ctx.fillText(title, x + 16, y + 28);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `400 9.5px ${FONT.sans}`;
  ctx.fillText(sub, x + 16, y + 45);
  if (meta) {
    ctx.fillStyle = SALON.black;
    ctx.font = `500 11.5px ${FONT.semi}`;
    ctx.textAlign = 'right';
    ctx.fillText(meta, x + w - 16, y + 30);
    ctx.textAlign = 'left';
  }
  // Selection ring.
  ctx.beginPath();
  ctx.arc(x + w - 22, y + h - 20, 8, 0, Math.PI * 2);
  ctx.strokeStyle = selected ? SALON.champagne : 'rgba(21,18,15,0.18)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (selected) {
    ctx.beginPath();
    ctx.fillStyle = SALON.champagne;
    ctx.arc(x + w - 22, y + h - 20, 4.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function field(ctx, x, y, w, label, value, active, time) {
  ctx.save();
  ctx.fillStyle = SALON.taupe;
  ctx.font = `600 7.5px ${FONT.semi}`;
  drawTracked(ctx, label.toUpperCase(), x, y - 10, 1.4);
  fillRR(ctx, x, y - 2, w, 38, 9, active ? '#FFFFFF' : 'rgba(255,255,255,0.55)');
  strokeRR(ctx, x, y - 2, w, 38, 9, active ? alpha(SALON.champagne, 0.9) : SALON.line, 1);
  ctx.fillStyle = SALON.black;
  ctx.font = `400 11.5px ${FONT.sans}`;
  ctx.fillText(value, x + 12, y + 21);
  if (active) caret(ctx, x + 14 + measureTracked(ctx, value, 0), y + 24, time, SALON.champagne, 14);
  ctx.restore();
}

export function drawBookingStep(ctx, state) {
  const { step = 0, time = 0, typed = 1, pressed = null, scroll = 0 } = state;
  ctx.save();
  ctx.fillStyle = SALON.ivoryWarm;
  ctx.fillRect(0, 0, UI_W, UI_H);
  bookingHeader(ctx, step);

  if (step === 0) {
    stepTitle(ctx, 'Choose a service', 'Signature Glow is selected');
    STUDIO.makeup.packages.forEach((pack, index) => {
      optionCard(ctx, 22, 210 + index * 84, UI_W - 44, 72, {
        title: pack.name,
        sub: `${pack.duration} · with a Luxe artist`,
        meta: money(pack.price),
        selected: index === 0
      });
    });
    ctx.fillStyle = SALON.taupe;
    ctx.font = `400 9px ${FONT.sans}`;
    ctx.fillText('Other services are available in the full menu.', 22, 470);

    // Good-to-know card fills the lower screen with useful reassurance.
    const infoY = 500;
    fillRR(ctx, 22, infoY, UI_W - 44, 176, 14, 'rgba(201,169,107,0.1)');
    ctx.fillStyle = SALON.black;
    ctx.font = `500 11px ${FONT.semi}`;
    ctx.fillText('Good to know', 38, infoY + 28);
    const notes = [
      'A 60 minute session with a Luxe artist.',
      'Skin prep and finishing are included.',
      'Nothing is charged when you send a request.'
    ];
    notes.forEach((note, index) => {
      const y = infoY + 54 + index * 22;
      ctx.strokeStyle = alpha(SALON.champagne, 0.9);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(38, y - 3);
      ctx.lineTo(42, y + 1);
      ctx.lineTo(49, y - 7);
      ctx.stroke();
      ctx.fillStyle = 'rgba(21,18,15,0.66)';
      ctx.font = `400 9.5px ${FONT.sans}`;
      ctx.fillText(note, 58, y);
    });
    ctx.fillStyle = 'rgba(21,18,15,0.42)';
    ctx.font = `400 8.5px ${FONT.sans}`;
    ctx.fillText('Luxe Studio confirms availability after your request.', 38, infoY + 152);
  }

  if (step === 1) {
    stepTitle(ctx, 'Preferred date', 'March 2026 · studio timezone');
    const dateY = 214;
    ctx.fillStyle = SALON.black;
    ctx.font = `500 10px ${FONT.semi}`;
    ctx.fillText('Next available days', 22, dateY);
    B.dates.forEach((date, index) => {
      const x = 22 + index * 84;
      const active = index === 1;
      fillRR(ctx, x, dateY + 14, 74, 74, 12, active ? SALON.black : '#FFFFFF');
      if (!active) strokeRR(ctx, x, dateY + 14, 74, 74, 12, SALON.line, 1);
      ctx.fillStyle = active ? SALON.champagneSoft : SALON.taupe;
      ctx.font = `500 9px ${FONT.semi}`;
      ctx.textAlign = 'center';
      ctx.fillText(date.label.toUpperCase(), x + 37, dateY + 38);
      ctx.fillStyle = active ? SALON.white : SALON.black;
      ctx.font = `400 22px ${FONT.serif}`;
      ctx.fillText(date.day, x + 37, dateY + 66);
      ctx.textAlign = 'left';
    });

    // Simple month grid.
    const gridY = 348;
    ctx.fillStyle = SALON.black;
    ctx.font = `500 10px ${FONT.semi}`;
    ctx.fillText('March', 22, gridY);
    ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((day, index) => {
      ctx.fillStyle = SALON.taupe;
      ctx.font = `500 8px ${FONT.semi}`;
      ctx.textAlign = 'center';
      ctx.fillText(day, 40 + index * 47, gridY + 24);
    });
    ctx.textAlign = 'left';
    for (let i = 0; i < 21; i += 1) {
      const col = i % 7;
      const row = Math.floor(i / 7);
      // The copied month starts on the 10th so 14 March lands on Friday,
      // matching the date chips, confirmation and notification copy.
      const day = i + 10;
      const x = 40 + col * 47;
      const y = gridY + 52 + row * 40;
      const selected = day === 14;
      if (selected) {
        ctx.beginPath();
        ctx.fillStyle = SALON.champagne;
        ctx.arc(x, y - 4, 13, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = selected ? SALON.white : 'rgba(21,18,15,0.75)';
      ctx.font = `400 10.5px ${FONT.sans}`;
      ctx.textAlign = 'center';
      ctx.fillText(String(day), x, y);
    }
    ctx.textAlign = 'left';

    ctx.fillStyle = alpha(SALON.espresso, 0.55);
    ctx.font = `400 9px ${FONT.sans}`;
    ctx.fillText('Times are requested, then confirmed by the studio.', 22, 618);
  }

  if (step === 2) {
    stepTitle(ctx, 'Preferred time', 'Fri 14 March · 60 min session');
    B.times.forEach((timeLabel, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 22 + col * 174;
      const y = 222 + row * 62;
      const active = index === 1;
      fillRR(ctx, x, y, 160, 50, 10, active ? SALON.black : '#FFFFFF');
      if (!active) strokeRR(ctx, x, y, 160, 50, 10, SALON.line, 1);
      ctx.fillStyle = active ? SALON.white : SALON.black;
      ctx.font = `500 11.5px ${FONT.semi}`;
      ctx.textAlign = 'center';
      ctx.fillText(timeLabel, x + 80, y + 25);
      ctx.textAlign = 'left';
    });
    ctx.fillStyle = 'rgba(21,18,15,0.55)';
    ctx.font = `400 9px ${FONT.sans}`;
    ctx.fillText('A request is sent first — nothing is charged today.', 22, 470);
    ctx.fillStyle = 'rgba(21,18,15,0.55)';
    ctx.fillText('The studio confirms your slot before it is held.', 22, 486);
  }

  if (step === 3) {
    stepTitle(ctx, 'Your details', 'Only what the studio needs');
    field(ctx, 22, 226, UI_W - 44, 'Full name', typedText(B.customer.name, typed, 0, 0.34), typed < 0.34, time);
    field(ctx, 22, 300, UI_W - 44, 'Mobile', typedText(B.customer.phone, typed, 0.34, 0.7), typed >= 0.34 && typed < 0.7, time);
    field(ctx, 22, 374, UI_W - 44, 'Email', typedText(B.customer.email, typed, 0.7, 1), typed >= 0.7, time);

    ctx.strokeStyle = alpha(SALON.champagne, 0.9);
    ctx.lineWidth = 1.4;
    rrPath(ctx, 22, 430, 15, 15, 4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(25, 437);
    ctx.lineTo(29, 441);
    ctx.lineTo(36, 432);
    ctx.stroke();
    ctx.fillStyle = 'rgba(21,18,15,0.7)';
    ctx.font = `400 9.5px ${FONT.sans}`;
    ctx.fillText('Luxe Studio may contact me about this request.', 46, 442);
  }

  if (step === 4) {
    stepTitle(ctx, 'Review request', 'One last look before it is sent');
    fillRR(ctx, 22, 210, UI_W - 44, 252, 14, '#FFFFFF');
    strokeRR(ctx, 22, 210, UI_W - 44, 252, 14, SALON.line, 1);

    ctx.fillStyle = SALON.taupe;
    ctx.font = `600 7.5px ${FONT.semi}`;
    drawTracked(ctx, 'SERVICE', 38, 240, 1.4);
    ctx.fillStyle = SALON.black;
    ctx.font = `400 19px ${FONT.serif}`;
    ctx.fillText('Signature Glow', 38, 264);
    ctx.fillStyle = SALON.taupe;
    ctx.font = `400 9.5px ${FONT.sans}`;
    ctx.fillText('Makeup · 60 minutes · $120', 38, 282);

    divider(ctx, 38, 302, UI_W - 76);

    const rows = [
      ['DATE', B.chosenDate],
      ['TIME', B.chosenTime],
      ['NAME', B.customer.name],
      ['CONTACT', B.customer.phone]
    ];
    rows.forEach(([label, value], index) => {
      const y = 328 + index * 30;
      ctx.fillStyle = SALON.taupe;
      ctx.font = `600 7.5px ${FONT.semi}`;
      drawTracked(ctx, label, 38, y, 1.4);
      ctx.fillStyle = SALON.black;
      ctx.font = `400 10.5px ${FONT.sans}`;
      ctx.textAlign = 'right';
      ctx.fillText(value, UI_W - 40, y + 1);
      ctx.textAlign = 'left';
    });

    ctx.fillStyle = 'rgba(21,18,15,0.55)';
    ctx.font = `400 8.5px ${FONT.sans}`;
    ctx.fillText('The studio confirms availability before your slot is held.', 22, 492);
  }

  ctx.restore();
  stickyBar(ctx, step === 4 ? 'Send Request' : 'Continue', {
    pressed: pressed === 'cta' ? 1 : 0,
    sub: step === 4 ? 'No payment taken' : 'Times are requested, not held'
  });
}

function typedText(full, p, from, to) {
  const local = clamp((p - from) / (to - from));
  const count = Math.floor(local * full.length);
  return full.slice(0, count);
}

export function drawConfirmation(ctx, state) {
  const { appear = 1, time = 0 } = state;
  ctx.save();
  ctx.fillStyle = SALON.ivoryWarm;
  ctx.fillRect(0, 0, UI_W, UI_H);
  statusBar(ctx, { dark: false, time: '9:45' });

  const ease = clamp(appear);
  ctx.save();
  ctx.translate(0, (1 - ease) * 18);
  ctx.globalAlpha = ease;

  // Success mark.
  const cx = UI_W / 2;
  const cy = 220;
  ctx.save();
  ctx.fillStyle = radialGradient(ctx, cx, cy, 0, 84, [
    [0, alpha(MANVEON.lime, 0.22)],
    [1, alpha(MANVEON.lime, 0)]
  ]);
  ctx.beginPath();
  ctx.arc(cx, cy, 84, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = alpha(SALON.champagne, 0.65);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, 46, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = SALON.black;
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = MANVEON.lime;
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy + 1);
  ctx.lineTo(cx - 3, cy + 12);
  ctx.lineTo(cx + 16, cy - 11);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = SALON.champagne;
  ctx.font = `600 8px ${FONT.semi}`;
  drawTracked(ctx, 'REQUEST SENT', cx, 312, 2.6, 'center');
  ctx.fillStyle = SALON.black;
  ctx.font = `400 30px ${FONT.serif}`;
  ctx.fillText('Request received', cx, 352);
  ctx.fillStyle = 'rgba(21,18,15,0.62)';
  ctx.font = `400 10.5px ${FONT.sans}`;
  ctx.fillText('Thank you, Aisha. Luxe Studio will confirm', cx, 380);
  ctx.fillText('availability by text or email shortly.', cx, 396);

  // Summary card.
  const cardY = 432;
  fillRR(ctx, 30, cardY, UI_W - 60, 150, 14, '#FFFFFF');
  strokeRR(ctx, 30, cardY, UI_W - 60, 150, 14, SALON.line, 1);
  ctx.textAlign = 'left';
  ctx.fillStyle = SALON.black;
  ctx.font = `500 12.5px ${FONT.semi}`;
  ctx.fillText('Signature Glow', 48, cardY + 30);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `400 9.5px ${FONT.sans}`;
  ctx.fillText('Makeup · 60 min · $120', 48, cardY + 47);
  divider(ctx, 48, cardY + 62, UI_W - 96);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `600 7.5px ${FONT.semi}`;
  drawTracked(ctx, 'REQUESTED', 48, cardY + 84, 1.4);
  ctx.fillStyle = SALON.black;
  ctx.font = `500 11px ${FONT.semi}`;
  ctx.fillText(`${B.chosenDate} · ${B.chosenTime}`, 48, cardY + 102);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `400 9px ${FONT.sans}`;
  ctx.fillText(`Reference ${B.reference}`, 48, cardY + 122);

  // The important nuance: a request is not a guaranteed slot.
  fillRR(ctx, 30, cardY + 172, UI_W - 60, 68, 12, 'rgba(201,169,107,0.12)');
  ctx.fillStyle = 'rgba(21,18,15,0.72)';
  ctx.font = `400 9.5px ${FONT.sans}`;
  ctx.fillText('This is an appointment request.', 48, cardY + 196);
  ctx.fillText('Your time is not confirmed until the studio', 48, cardY + 212);
  ctx.fillText('or its booking system replies.', 48, cardY + 228);

  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(21,18,15,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 62, 710);
  ctx.lineTo(cx + 62, 710);
  ctx.stroke();
  ctx.fillStyle = SALON.black;
  ctx.font = `500 11px ${FONT.semi}`;
  ctx.fillText('Back to website', cx, 732);
  ctx.restore();
  ctx.restore();
}

// Two notifications on a softly lit lock screen.
export function drawNotifications(ctx, state) {
  const { one = 0, two = 0, time = 0 } = state;
  ctx.save();
  ctx.fillStyle = '#0A0E14';
  ctx.fillRect(0, 0, UI_W, UI_H);

  // Ambient salon light behind the lock screen.
  ctx.fillStyle = radialGradient(ctx, UI_W * 0.3, UI_H * 0.2, 0, UI_W, [
    [0, 'rgba(201,169,107,0.2)'],
    [0.6, 'rgba(80,90,110,0.06)'],
    [1, 'rgba(0,0,0,0)']
  ]);
  ctx.fillRect(0, 0, UI_W, UI_H);

  statusBar(ctx, { dark: true, time: '9:45' });

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `400 56px ${FONT.serif}`;
  ctx.fillText('9:45', UI_W / 2, 156);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `400 11px ${FONT.sans}`;
  ctx.fillText('Friday 14 March', UI_W / 2, 178);
  ctx.textAlign = 'left';

  const card = (y, appear, data) => {
    if (appear <= 0) return;
    const ease = clamp(appear);
    ctx.save();
    ctx.globalAlpha = ease;
    ctx.translate(0, (1 - ease) * -22);
    fillRR(ctx, 14, y, UI_W - 28, 92, 18, 'rgba(28,32,40,0.82)');
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    rrPath(ctx, 14, y, UI_W - 28, 92, 18);
    ctx.stroke();

    fillRR(ctx, 28, y + 16, 26, 26, 8, 'rgba(201,169,107,0.22)');
    icon(ctx, 'calendar', 33, y + 21, 16, SALON.champagneSoft, 1.6);

    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.font = `600 10.5px ${FONT.semi}`;
    ctx.fillText(data.title, 64, y + 28);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `400 8.5px ${FONT.sans}`;
    ctx.textAlign = 'right';
    ctx.fillText(data.time, UI_W - 30, y + 27);
    ctx.textAlign = 'left';

    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `400 9.5px ${FONT.sans}`;
    const words = data.body.split(' ');
    let line = '';
    let lineIndex = 0;
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (measureTracked(ctx, next, 0) > UI_W - 100) {
        ctx.fillText(line, 64, y + 46 + lineIndex * 13);
        line = word;
        lineIndex += 1;
      } else {
        line = next;
      }
    }
    if (line) ctx.fillText(line, 64, y + 46 + lineIndex * 13);
    ctx.restore();
  };

  card(220, one, STUDIO.notifications[0]);
  card(326, two, STUDIO.notifications[1]);

  // Bottom affordances.
  icon(ctx, 'globe', 42, UI_H - 78, 20, 'rgba(255,255,255,0.5)', 1.6);
  icon(ctx, 'message', UI_W - 62, UI_H - 78, 20, 'rgba(255,255,255,0.5)', 1.6);
  fillRR(ctx, UI_W / 2 - 60, UI_H - 28, 120, 5, 2.5, 'rgba(255,255,255,0.5)');
  ctx.restore();
}
