// The salon owner's mobile business dashboard.
import { alpha, fillRR, strokeRR, rrPath, radialGradient, drawTracked, measureTracked, clamp, easeOutCubic } from '../draw.js';
import { SALON, FONT, MANVEON } from '../theme.js';
import { UI_W, UI_H, statusBar, icon, avatar, divider } from './primitives.js';
import { STUDIO } from '../content.js';

const TABS = [
  { label: 'Enquiries', icon: 'message' },
  { label: 'Requests', icon: 'calendar' },
  { label: 'Confirmed', icon: 'check' },
  { label: 'Customers', icon: 'user' }
];

function statusChip(ctx, x, y, text, tone) {
  const colors = {
    new: MANVEON.lime,
    waiting: MANVEON.blueBright,
    muted: 'rgba(255,255,255,0.55)',
    confirmed: MANVEON.lime
  };
  const color = colors[tone] || colors.muted;
  ctx.save();
  ctx.font = `600 8px ${FONT.semi}`;
  const w = measureTracked(ctx, text.toUpperCase(), 1.2) + 20;
  fillRR(ctx, x - w, y - 10, w, 20, 10, alpha(color, tone === 'confirmed' || tone === 'new' ? 0.16 : 0.12));
  ctx.fillStyle = color;
  drawTracked(ctx, text.toUpperCase(), x - w / 2, y + 0.5, 1.2, 'center');
  ctx.restore();
  return w;
}

function row(ctx, x, y, w, data, opts = {}) {
  const { tone = 'muted', selected = false, compact = false } = opts;
  const h = compact ? 58 : 96;
  fillRR(ctx, x, y, w, h, 12, selected ? 'rgba(198,255,61,0.07)' : 'rgba(255,255,255,0.035)');
  strokeRR(ctx, x, y, w, h, 12, selected ? alpha(MANVEON.lime, 0.45) : 'rgba(255,255,255,0.07)', 1);

  fillRR(ctx, x + 12, y + 14, compact ? 34 : 38, compact ? 34 : 38, 19, 'rgba(201,169,107,0.14)');
  ctx.fillStyle = SALON.champagneSoft;
  ctx.font = `400 ${compact ? 12 : 13}px ${FONT.serif}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.name.split(' ').map((p) => p[0]).join('').slice(0, 2), x + 12 + (compact ? 17 : 19), y + (compact ? 31 : 33));
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.font = `500 ${compact ? 10.5 : 11.5}px ${FONT.semi}`;
  ctx.fillText(data.name, x + (compact ? 58 : 62), y + (compact ? 24 : 30));
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `400 8.5px ${FONT.sans}`;
  ctx.fillText(data.service, x + (compact ? 58 : 62), y + (compact ? 38 : 45));
  if (!compact) {
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.font = `400 8.5px ${FONT.sans}`;
    ctx.fillText(data.when, x + 62, y + 60);
    ctx.fillStyle = alpha(MANVEON.blueBright, 0.85);
    ctx.font = `600 7px ${FONT.semi}`;
    drawTracked(ctx, 'FROM WEBSITE', x + 62, y + 78, 1.2);
  }
  if (data.status) statusChip(ctx, x + w - 14, y + (compact ? 29 : 28), data.status, tone);
}

export function drawOwnerDashboard(ctx, state) {
  const { sheet = 0, confirmed = 0, time = 0 } = state;
  ctx.save();
  ctx.fillStyle = '#071019';
  ctx.fillRect(0, 0, UI_W, UI_H);

  // Ambient light.
  ctx.fillStyle = radialGradient(ctx, UI_W * 0.8, 40, 0, 320, [
    [0, alpha(MANVEON.blue, 0.16)],
    [1, alpha(MANVEON.blue, 0)]
  ]);
  ctx.fillRect(0, 0, UI_W, 400);
  ctx.fillStyle = radialGradient(ctx, 20, UI_H * 0.75, 0, 300, [
    [0, alpha(MANVEON.lime, 0.08)],
    [1, alpha(MANVEON.lime, 0)]
  ]);
  ctx.fillRect(0, 300, UI_W, UI_H - 300);

  statusBar(ctx, { dark: true, time: '9:47' });

  // Owner identity.
  ctx.save();
  ctx.strokeStyle = alpha(MANVEON.lime, 0.5);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(34, 66, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  avatar(ctx, 34, 66, 14, 'LS', { fill: 'rgba(201,169,107,0.18)', color: SALON.champagneSoft, size: 10 });
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = `500 11.5px ${FONT.semi}`;
  ctx.fillText('Luxe Studio', 60, 63);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = `500 7px ${FONT.semi}`;
  drawTracked(ctx, 'OWNER VIEW', 60, 76, 1.5);

  icon(ctx, 'bell', UI_W - 40, 58, 18, 'rgba(255,255,255,0.65)', 1.5);
  ctx.fillStyle = MANVEON.lime;
  ctx.beginPath();
  ctx.arc(UI_W - 27, 58, 3, 0, Math.PI * 2);
  ctx.fill();

  // Title.
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.font = `600 26px ${FONT.semi}`;
  ctx.fillText('Today', 22, 128);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `400 9.5px ${FONT.sans}`;
  ctx.fillText('Fri 14 March · requests and confirmed bookings', 22, 146);

  // Sync badge.
  const pulse = 0.6 + 0.4 * Math.sin(time * 3);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = MANVEON.lime;
  ctx.beginPath();
  ctx.arc(UI_W - 108, 122, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = alpha(MANVEON.lime, 0.85);
  ctx.font = `600 7px ${FONT.semi}`;
  drawTracked(ctx, 'SYNCED FROM WEBSITE', UI_W - 100, 125, 1.2);

  // Tabs.
  const tabY = 182;
  const tabW = (UI_W - 44) / 3;
  ['Enquiries', 'Requests', 'Confirmed'].forEach((label, index) => {
    const x = 22 + index * tabW;
    const active = index === 1;
    ctx.fillStyle = active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)';
    ctx.font = `${active ? 600 : 400} 9.5px ${active ? FONT.semi : FONT.sans}`;
    ctx.textAlign = 'center';
    drawTracked(ctx, label.toUpperCase(), x + tabW / 2, tabY, 1.2, 'center');
    if (active) {
      fillRR(ctx, x + tabW / 2 - 18, tabY + 10, 36, 2, 1, MANVEON.lime);
    }
  });
  ctx.textAlign = 'left';
  divider(ctx, 0, tabY + 26, UI_W, 'rgba(255,255,255,0.08)');

  // Requests list.
  const listY = tabY + 44;
  STUDIO.dashboard.rows.forEach((data, index) => {
    row(ctx, 22, listY + index * 106, UI_W - 44, data, {
      tone: index === 0 ? 'new' : index === 1 ? 'waiting' : 'muted',
      selected: index === 0 && sheet > 0.2
    });
  });

  // Upcoming appointments.
  const upY = listY + 3 * 106 + 8;
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `600 7px ${FONT.semi}`;
  drawTracked(ctx, 'UPCOMING APPOINTMENTS', 22, upY, 1.4);
  row(ctx, 22, upY + 12, UI_W - 44, {
    name: 'Mira Patel',
    service: 'Hair Styling · Sat 15, 1:00 PM',
    status: confirmed ? 'Confirmed' : 'Awaiting confirmation'
  }, { tone: confirmed ? 'confirmed' : 'waiting', compact: true });

  // Bottom navigation.
  ctx.fillStyle = 'rgba(7,16,25,0.96)';
  ctx.fillRect(0, UI_H - 78, UI_W, 78);
  divider(ctx, 0, UI_H - 78, UI_W, 'rgba(255,255,255,0.08)');
  TABS.forEach((tab, index) => {
    const x = 54 + index * 94;
    const active = index === 1;
    icon(ctx, tab.icon, x - 9, UI_H - 56, 18, active ? MANVEON.lime : 'rgba(255,255,255,0.35)', 1.6);
    ctx.fillStyle = active ? MANVEON.lime : 'rgba(255,255,255,0.3)';
    ctx.font = `500 6.5px ${FONT.medium}`;
    ctx.textAlign = 'center';
    drawTracked(ctx, tab.label.toUpperCase(), x, UI_H - 28, 1, 'center');
  });
  ctx.textAlign = 'left';

  // Detail sheet.
  if (sheet > 0) {
    const ease = easeOutCubic(clamp(sheet));
    ctx.fillStyle = `rgba(2,7,12,${0.55 * ease})`;
    ctx.fillRect(0, 0, UI_W, UI_H);

    const sheetY = UI_H - 452 * ease;
    ctx.save();
    ctx.translate(0, sheetY);
    fillRR(ctx, 0, 0, UI_W, 470, 24, '#0D1826');
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    rrPath(ctx, 0, 0, UI_W, 470, 24);
    ctx.stroke();

    fillRR(ctx, UI_W / 2 - 22, 10, 44, 4, 2, 'rgba(255,255,255,0.25)');

    ctx.fillStyle = alpha(MANVEON.lime, 0.9);
    ctx.font = `600 7.5px ${FONT.semi}`;
    drawTracked(ctx, 'APPOINTMENT REQUEST', 24, 44, 1.6);

    ctx.fillStyle = 'rgba(255,255,255,0.96)';
    ctx.font = `600 21px ${FONT.semi}`;
    ctx.fillText('Aisha Khan', 24, 74);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `400 9.5px ${FONT.sans}`;
    ctx.fillText('Requested Fri 14 March at 11:30 AM', 24, 92);

    // Service card.
    fillRR(ctx, 24, 108, UI_W - 48, 62, 12, 'rgba(255,255,255,0.05)');
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = `500 11px ${FONT.semi}`;
    ctx.fillText('Signature Glow', 40, 132);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = `400 8.5px ${FONT.sans}`;
    ctx.fillText('Makeup · 60 min · $120', 40, 148);
    if (confirmed > 0) {
      statusChip(ctx, UI_W - 40, 138, 'Confirmed', 'confirmed');
    } else {
      statusChip(ctx, UI_W - 40, 138, 'New request', 'new');
    }

    divider(ctx, 24, 188, UI_W - 48, 'rgba(255,255,255,0.08)');

    // Customer details.
    const details = [
      { icon: 'phone', value: STUDIO.dashboard.rows[0].phone },
      { icon: 'mail', value: STUDIO.dashboard.rows[0].email }
    ];
    details.forEach((item, index) => {
      icon(ctx, item.icon, 24, 204 + index * 30, 15, 'rgba(255,255,255,0.45)', 1.5);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = `400 10px ${FONT.sans}`;
      ctx.fillText(item.value, 48, 218 + index * 30);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = `400 8.5px ${FONT.sans}`;
    ctx.fillText('Customer details come from the website request form.', 24, 278);

    // Status action.
    const btnY = 304;
    if (confirmed > 0) {
      fillRR(ctx, 24, btnY, UI_W - 48, 48, 24, alpha(MANVEON.lime, 0.14));
      strokeRR(ctx, 24, btnY, UI_W - 48, 48, 24, alpha(MANVEON.lime, 0.7), 1.2);
      ctx.fillStyle = MANVEON.lime;
      ctx.font = `600 11.5px ${FONT.semi}`;
      const labelWidth = measureTracked(ctx, 'CONFIRMED', 1.6);
      const startX = UI_W / 2 - (labelWidth + 24) / 2;
      icon(ctx, 'check', startX, btnY + 15, 18, MANVEON.lime, 2);
      drawTracked(ctx, 'CONFIRMED', startX + 26, btnY + 29, 1.6, 'left');
    } else {
      fillRR(ctx, 24, btnY, UI_W - 48, 48, 24, MANVEON.lime);
      ctx.fillStyle = '#06121C';
      ctx.font = `600 11.5px ${FONT.semi}`;
      ctx.textAlign = 'center';
      drawTracked(ctx, 'MARK AS CONFIRMED', UI_W / 2, btnY + 29, 1.6, 'center');
      ctx.textAlign = 'left';
    }

    // Inline status feedback replaces the helper line once confirmed.
    if (confirmed > 0.4) {
      ctx.save();
      ctx.globalAlpha = clamp((confirmed - 0.4) / 0.35);
      ctx.translate(0, (1 - clamp(confirmed)) * 10);
      fillRR(ctx, 24, btnY + 62, UI_W - 48, 40, 20, alpha(MANVEON.lime, 0.12));
      strokeRR(ctx, 24, btnY + 62, UI_W - 48, 40, 20, alpha(MANVEON.lime, 0.45), 1);
      icon(ctx, 'check', 40, btnY + 74, 16, MANVEON.lime, 2);
      ctx.fillStyle = MANVEON.lime;
      ctx.font = `500 9px ${FONT.medium}`;
      ctx.fillText('Status updated to confirmed', 64, btnY + 87);
      ctx.restore();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = `400 8px ${FONT.sans}`;
      ctx.textAlign = 'center';
      ctx.fillText('Confirmation updates the customer’s request status.', UI_W / 2, btnY + 70);
      ctx.textAlign = 'left';
    }

    ctx.restore();
  }

  ctx.restore();
}
