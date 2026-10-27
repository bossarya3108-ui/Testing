// Luxe Studio mobile website: home, services, makeup detail, navigation drawer
// and the social profile the customer discovers first.
import { alpha, fillRR, strokeRR, rrPath, radialGradient, drawTracked, clamp, paragraph } from '../draw.js';
import { SALON, FONT } from '../theme.js';
import { STUDIO, money } from '../content.js';
import { UI_W, UI_H, statusBar, icon, editorialArt, button, sectionLabel, divider, avatar, monogram, stickyBar } from './primitives.js';

// Height of the phone status bar (including the dynamic island) and of the
// site navigation below it. All page content is positioned from TOP.
const STATUS_H = 58;
const HEADER_H = 56;
const TOP = STATUS_H + HEADER_H;

export const LAYOUT = {
  homeHeight: 1720,
  exploreY: 580,
  exploreScroll: 430,
  makeupHeight: 1080,
  makeupScroll: 210,
  menuWidth: 300
};

function siteHeader(ctx, { title = null, dark = false, menuOpen = false }) {
  const ink = dark ? SALON.ivory : SALON.black;
  ctx.save();
  // Solid status-bar backdrop so scrolled content never shows through.
  ctx.fillStyle = dark ? '#13100D' : SALON.ivoryWarm;
  ctx.fillRect(0, 0, UI_W, STATUS_H);
  ctx.fillStyle = dark ? '#13100D' : SALON.ivoryWarm;
  ctx.fillRect(0, STATUS_H, UI_W, HEADER_H);
  ctx.strokeStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(21,18,15,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, STATUS_H + HEADER_H);
  ctx.lineTo(UI_W, STATUS_H + HEADER_H);
  ctx.stroke();

  if (title) {
    icon(ctx, 'back', 24, STATUS_H + 25, 18, ink);
    ctx.fillStyle = ink;
    ctx.font = `600 12px ${FONT.semi}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    drawTracked(ctx, title.toUpperCase(), UI_W / 2, STATUS_H + 26, 2.4, 'center');
  } else {
    monogram(ctx, 34, STATUS_H + 22, 13, { dark });
    ctx.fillStyle = ink;
    ctx.font = `400 14px ${FONT.serif}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    drawTracked(ctx, 'LUXE STUDIO', 54, STATUS_H + 23, 2.2);
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.45)' : SALON.taupe;
    ctx.font = `500 6.5px ${FONT.semi}`;
    drawTracked(ctx, 'BEAUTY & SALON', 55, STATUS_H + 36, 1.6);
  }

  icon(ctx, menuOpen ? 'chevron' : 'menu', UI_W - 36, STATUS_H + 22, 18, ink);
  ctx.restore();
}

function homeBody(ctx) {
  const heroY = TOP + 16;
  editorialArt(ctx, 16, heroY, UI_W - 32, 322, {
    variant: 'silk',
    tone: 'charcoal',
    radius: 18,
    seed: 3
  });

  ctx.save();
  ctx.fillStyle = SALON.champagneSoft;
  ctx.font = `600 8px ${FONT.semi}`;
  drawTracked(ctx, 'BEAUTY & SALON · HALCYON QUARTER', 34, heroY + 210, 2);
  ctx.fillStyle = '#FFF9F0';
  ctx.font = `400 40px ${FONT.serif}`;
  ctx.fillText('Beauty,', 32, heroY + 256);
  ctx.fillText('refined.', 32, heroY + 296);
  ctx.fillStyle = 'rgba(255,250,243,0.8)';
  ctx.font = `400 10.5px ${FONT.sans}`;
  ctx.fillText('Hair, skin, makeup and nails', 33, heroY + 316);
  ctx.restore();

  // Primary actions.
  button(ctx, 16, heroY + 344, (UI_W - 44) / 2, 44, 'Explore Services', {
    fill: SALON.black,
    size: 11
  });
  button(ctx, 16 + (UI_W - 44) / 2 + 12, heroY + 344, (UI_W - 44) / 2, 44, 'Book Appointment', {
    fill: 'transparent',
    color: SALON.black,
    border: 'rgba(21,18,15,0.35)',
    size: 11
  });

  // Explore services.
  const exploreY = LAYOUT.exploreY;
  sectionLabel(ctx, 20, exploreY + 4, 'Explore Services', { color: SALON.champagne, size: 8.5 });
  ctx.fillStyle = SALON.black;
  ctx.font = `400 26px ${FONT.serif}`;
  ctx.fillText('Four studios,', 20, exploreY + 36);
  ctx.fillText('one address.', 20, exploreY + 66);

  const cardArt = [
    { variant: 'silk', tone: 'champagne' },
    { variant: 'glass', tone: 'ivory' },
    { variant: 'gold', tone: 'charcoal' },
    { variant: 'pearl', tone: 'rose' }
  ];
  STUDIO.services.forEach((service, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 20 + col * 179;
    const y = exploreY + 86 + row * 132;
    editorialArt(ctx, x, y, 171, 120, {
      ...cardArt[index],
      radius: 12,
      seed: index + 11
    });
    ctx.fillStyle = SALON.white;
    ctx.font = `500 13px ${FONT.semi}`;
    ctx.fillText(service.name, x + 12, y + 96);
    ctx.fillStyle = 'rgba(255,250,243,0.82)';
    ctx.font = `400 9.5px ${FONT.sans}`;
    ctx.fillText(`from ${money(service.from)}`, x + 12, y + 110);
    icon(ctx, 'chevron', x + 148, y + 14, 12, 'rgba(255,255,255,0.85)', 1.4);
  });

  // Featured treatments.
  const featuredY = exploreY + 390;
  sectionLabel(ctx, 20, featuredY, 'Featured treatments', { color: SALON.champagne, size: 8.5 });
  ctx.fillStyle = SALON.black;
  ctx.font = `400 24px ${FONT.serif}`;
  ctx.fillText('Loved this season', 20, featuredY + 30);

  const featuredArt = [
    { variant: 'gold', tone: 'charcoal' },
    { variant: 'silk', tone: 'champagne' },
    { variant: 'glass', tone: 'ivory' }
  ];
  STUDIO.featured.forEach((item, index) => {
    const y = featuredY + 48 + index * 74;
    editorialArt(ctx, 20, y, 56, 56, {
      ...featuredArt[index],
      radius: 10,
      seed: 31 + index
    });
    ctx.fillStyle = SALON.black;
    ctx.font = `500 12px ${FONT.semi}`;
    ctx.fillText(item.name, 88, y + 24);
    ctx.fillStyle = SALON.taupe;
    ctx.font = `400 9.5px ${FONT.sans}`;
    ctx.fillText(item.detail, 88, y + 39);
    ctx.fillStyle = SALON.black;
    ctx.font = `500 11px ${FONT.semi}`;
    ctx.textAlign = 'right';
    ctx.fillText(money(item.price), UI_W - 24, y + 28);
    ctx.textAlign = 'left';
    if (index < STUDIO.featured.length - 1) divider(ctx, 20, y + 66, UI_W - 40);
  });

  // Visit / contact.
  const visitY = featuredY + 320;
  sectionLabel(ctx, 20, visitY, 'Visit', { color: SALON.champagne, size: 8.5 });
  ctx.fillStyle = SALON.black;
  ctx.font = `400 24px ${FONT.serif}`;
  ctx.fillText('Find us', 20, visitY + 30);

  // Stylised map card.
  const mapY = visitY + 44;
  fillRR(ctx, 20, mapY, UI_W - 40, 118, 14, '#EFE6D9');
  ctx.save();
  rrPath(ctx, 20, mapY, UI_W - 40, 118, 14);
  ctx.clip();
  ctx.strokeStyle = 'rgba(21,18,15,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i += 1) {
    ctx.beginPath();
    ctx.moveTo(20, mapY + i * 14);
    ctx.lineTo(UI_W - 20, mapY + i * 14 - 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20 + i * 40, mapY);
    ctx.lineTo(20 + i * 40 - 18, mapY + 118);
    ctx.stroke();
  }
  ctx.strokeStyle = alpha(SALON.champagne, 0.8);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(20, mapY + 92);
  ctx.bezierCurveTo(120, mapY + 72, 190, mapY + 96, UI_W - 20, mapY + 40);
  ctx.stroke();
  const pinX = 250;
  const pinY = mapY + 52;
  ctx.fillStyle = radialGradient(ctx, pinX, pinY, 0, 26, [
    [0, alpha(SALON.champagne, 0.55)],
    [1, alpha(SALON.champagne, 0)]
  ]);
  ctx.beginPath();
  ctx.arc(pinX, pinY, 26, 0, Math.PI * 2);
  ctx.fill();
  icon(ctx, 'pin', pinX - 9, pinY - 20, 18, SALON.black, 1.8);
  ctx.restore();

  const contactY = mapY + 136;
  const rows = [
    { icon: 'pin', text: `${STUDIO.address}, ${STUDIO.area}` },
    { icon: 'clock', text: STUDIO.hours },
    { icon: 'phone', text: STUDIO.phone },
    { icon: 'mail', text: STUDIO.email }
  ];
  rows.forEach((row, index) => {
    icon(ctx, row.icon, 22, contactY + index * 30 - 2, 15, SALON.taupe, 1.5);
    ctx.fillStyle = SALON.black;
    ctx.font = `400 10.5px ${FONT.sans}`;
    ctx.fillText(row.text, 46, contactY + index * 30 + 8);
  });

  // Footer.
  const footerY = contactY + 140;
  divider(ctx, 20, footerY, UI_W - 40);
  monogram(ctx, UI_W / 2, footerY + 34, 12);
  ctx.fillStyle = SALON.black;
  ctx.font = `400 16px ${FONT.serif}`;
  ctx.textAlign = 'center';
  ctx.fillText('Luxe Studio', UI_W / 2, footerY + 68);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `500 7.5px ${FONT.semi}`;
  drawTracked(ctx, 'BEAUTY & SALON · @LUXESTUDIO.SALON', UI_W / 2, footerY + 84, 1.8, 'center');
  ctx.fillStyle = alpha(SALON.champagne, 0.95);
  ctx.font = `600 7px ${FONT.semi}`;
  drawTracked(ctx, 'DIGITAL EXPERIENCE BY MANVEON', UI_W / 2, footerY + 104, 1.8, 'center');
  ctx.textAlign = 'left';
}

export function drawHome(ctx, state) {
  const { scroll = 0, time = 0, pressed = null } = state;
  ctx.save();
  ctx.fillStyle = SALON.ivoryWarm;
  ctx.fillRect(0, 0, UI_W, UI_H);
  ctx.save();
  ctx.translate(0, -scroll);
  homeBody(ctx, state);
  ctx.restore();
  siteHeader(ctx, { dark: false, menuOpen: false });
  statusBar(ctx, { dark: false, time: '9:41' });
  if (scroll > 40) {
    stickyBar(ctx, 'Book an Appointment', {
      pressed: pressed === 'book' ? 1 : 0,
      sub: 'Request a time — the studio confirms availability'
    });
  }
  ctx.restore();
}

export function drawMakeupPage(ctx, state) {
  const { scroll = 0, pressed = null } = state;
  ctx.save();
  ctx.fillStyle = SALON.ivoryWarm;
  ctx.fillRect(0, 0, UI_W, UI_H);
  ctx.save();
  ctx.translate(0, -scroll);

  editorialArt(ctx, 16, TOP + 12, UI_W - 32, 250, {
    variant: 'gold',
    tone: 'charcoal',
    radius: 18,
    seed: 7
  });
  ctx.fillStyle = SALON.champagneSoft;
  ctx.font = `600 8px ${FONT.semi}`;
  drawTracked(ctx, 'STUDIO 03 · MAKEUP', 34, TOP + 208, 2);
  ctx.fillStyle = '#FFF9F0';
  ctx.font = `400 42px ${FONT.serif}`;
  ctx.fillText('Makeup', 32, TOP + 248);

  const introY = TOP + 286;
  sectionLabel(ctx, 20, introY, 'Skin-first artistry', { color: SALON.champagne, size: 8.5 });
  paragraph(ctx, STUDIO.makeup.intro, {
    x: 20,
    y: introY + 26,
    maxWidth: UI_W - 40,
    size: 11.5,
    lineHeight: 18,
    family: FONT.sans,
    color: 'rgba(21,18,15,0.72)',
    align: 'left'
  });

  const packY = introY + 90;
  ctx.fillStyle = SALON.black;
  ctx.font = `400 24px ${FONT.serif}`;
  ctx.fillText('Packages', 20, packY);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `400 9.5px ${FONT.sans}`;
  ctx.fillText('Every price is a starting point', 20, packY + 16);

  STUDIO.makeup.packages.forEach((pack, index) => {
    const y = packY + 34 + index * 74;
    const active = index === 0;
    fillRR(ctx, 20, y, UI_W - 40, 64, 12, active ? '#FFFFFF' : 'rgba(255,255,255,0.6)');
    strokeRR(ctx, 20, y, UI_W - 40, 64, 12, active ? alpha(SALON.champagne, 0.9) : SALON.line, 1);
    ctx.fillStyle = SALON.black;
    ctx.font = `500 12.5px ${FONT.semi}`;
    ctx.fillText(pack.name, 34, y + 25);
    ctx.fillStyle = SALON.taupe;
    ctx.font = `400 9.5px ${FONT.sans}`;
    ctx.fillText(`${pack.duration} · consultation included`, 34, y + 41);
    ctx.fillStyle = SALON.black;
    ctx.font = `500 13px ${FONT.semi}`;
    ctx.textAlign = 'right';
    ctx.fillText(money(pack.price), UI_W - 40, y + 30);
    ctx.textAlign = 'left';
    if (active) fillRR(ctx, 20, y, 3, 64, 2, SALON.champagne);
  });

  // Included details.
  const incY = packY + 34 + STUDIO.makeup.packages.length * 74 + 18;
  divider(ctx, 20, incY, UI_W - 40);
  const points = ['Skin prep and priming', 'Lashes and finishing powder', 'A look built with you'];
  points.forEach((point, index) => {
    const y = incY + 26 + index * 22;
    ctx.strokeStyle = alpha(SALON.champagne, 0.9);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(22, y - 3);
    ctx.lineTo(26, y + 1);
    ctx.lineTo(33, y - 7);
    ctx.stroke();
    ctx.fillStyle = 'rgba(21,18,15,0.72)';
    ctx.font = `400 10.5px ${FONT.sans}`;
    ctx.fillText(point, 42, y);
  });

  // Artist note card.
  const noteY = incY + 108;
  fillRR(ctx, 20, noteY, UI_W - 40, 92, 14, '#EFE6D9');
  avatar(ctx, 46, noteY + 30, 16, 'LS');
  ctx.fillStyle = SALON.black;
  ctx.font = `500 11px ${FONT.semi}`;
  ctx.fillText('With Luxe Studio', 70, noteY + 26);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `400 9px ${FONT.sans}`;
  ctx.fillText('Your artist confirms the look before we begin.', 70, noteY + 40);
  ctx.fillStyle = 'rgba(21,18,15,0.62)';
  ctx.font = `400 9.5px ${FONT.sans}`;
  ctx.fillText('Ask about bridal and editorial bookings.', 34, noteY + 68);

  ctx.restore();
  siteHeader(ctx, { title: 'Makeup' });
  statusBar(ctx, { dark: false, time: '9:43' });
  stickyBar(ctx, 'Request Appointment', { pressed: pressed === 'request' ? 1 : 0 });
  ctx.restore();
}

// Navigation drawer, sliding in from the right.
export function drawMenu(ctx, state) {
  const { open = 0, selected = -1 } = state;
  ctx.save();
  ctx.fillStyle = `rgba(15,12,10,${0.45 * open})`;
  ctx.fillRect(0, 0, UI_W, UI_H);

  const panelX = UI_W - LAYOUT.menuWidth * open;
  ctx.save();
  ctx.translate(panelX, 0);
  fillRR(ctx, 0, 0, LAYOUT.menuWidth, UI_H, 0, SALON.ivoryWarm);
  ctx.fillStyle = alpha(SALON.champagne, 0.9);
  ctx.fillRect(0, 0, 2, UI_H);

  monogram(ctx, 34, STATUS_H + 20, 16);
  ctx.fillStyle = SALON.black;
  ctx.font = `400 17px ${FONT.serif}`;
  ctx.fillText('Luxe Studio', 58, STATUS_H + 16);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `500 7px ${FONT.semi}`;
  drawTracked(ctx, 'BEAUTY & SALON', 59, STATUS_H + 28, 1.6);
  icon(ctx, 'chevron', LAYOUT.menuWidth - 32, STATUS_H + 12, 18, SALON.taupe);

  const items = ['Home', 'Services', 'Makeup', 'Booking', 'Contact'];
  items.forEach((item, index) => {
    const y = 180 + index * 54;
    if (index === selected) {
      fillRR(ctx, 16, y - 24, LAYOUT.menuWidth - 32, 44, 8, 'rgba(201,169,107,0.16)');
    }
    ctx.fillStyle = alpha(SALON.champagne, 0.75);
    ctx.font = `500 8px ${FONT.semi}`;
    ctx.fillText(`0${index + 1}`, 22, y - 2);
    ctx.fillStyle = SALON.black;
    ctx.font = `400 23px ${FONT.serif}`;
    ctx.fillText(item, 52, y + 4);
  });

  divider(ctx, 22, 480, LAYOUT.menuWidth - 44);
  ctx.fillStyle = SALON.taupe;
  ctx.font = `400 9.5px ${FONT.sans}`;
  ctx.fillText(STUDIO.address, 22, 506);
  ctx.fillText(STUDIO.hours, 22, 522);
  ctx.fillText(STUDIO.phone, 22, 538);

  button(ctx, 22, 575, LAYOUT.menuWidth - 44, 44, 'Book an Appointment', {
    fill: SALON.black,
    size: 11,
    pressed: state.pressed ? 1 : 0
  });

  ctx.fillStyle = alpha(SALON.champagne, 0.9);
  ctx.font = `600 7px ${FONT.semi}`;
  drawTracked(ctx, 'DIGITAL EXPERIENCE BY MANVEON', 22, 800, 1.6);
  ctx.restore();
  ctx.restore();
}

// Instagram-style profile the customer lands on in scene 2.
export function drawSocialProfile(ctx, state) {
  const { scroll = 0 } = state;
  ctx.save();
  ctx.fillStyle = '#0D0F13';
  ctx.fillRect(0, 0, UI_W, UI_H);

  // App bar.
  ctx.fillStyle = 'rgba(13,15,19,0.94)';
  ctx.fillRect(0, 0, UI_W, STATUS_H + 42);
  ctx.fillStyle = '#F2F4F7';
  ctx.font = `500 14px ${FONT.semi}`;
  ctx.textAlign = 'center';
  ctx.fillText(STUDIO.instagram, UI_W / 2, STATUS_H + 26);
  ctx.textAlign = 'left';
  icon(ctx, 'back', 22, STATUS_H + 16, 17, '#E7EBF0', 1.6);
  icon(ctx, 'bell', UI_W - 42, STATUS_H + 16, 18, '#E7EBF0', 1.6);

  ctx.save();
  ctx.translate(0, -scroll);
  const avatarY = 166;
  ctx.save();
  ctx.strokeStyle = '#E6C27A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(60, avatarY, 33, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  avatar(ctx, 60, avatarY, 28, 'LS', { fill: '#2A211A', color: '#E6C27A' });

  ctx.fillStyle = '#F2F4F7';
  ctx.font = `500 12px ${FONT.semi}`;
  ctx.fillText('Luxe Studio', 108, avatarY - 18);
  ctx.fillStyle = 'rgba(242,244,247,0.55)';
  ctx.font = `400 9.5px ${FONT.sans}`;
  ctx.fillText(STUDIO.instagram, 108, avatarY - 3);
  ctx.fillStyle = '#E6C27A';
  ctx.font = `500 9px ${FONT.semi}`;
  ctx.fillText('New on Instagram', 108, avatarY + 14);

  // Bio.
  ctx.fillStyle = 'rgba(242,244,247,0.82)';
  ctx.font = `400 10.5px ${FONT.sans}`;
  ctx.fillText('Beauty & Salon · Halcyon Quarter', 22, avatarY + 58);
  ctx.fillText('Hair · Skin · Makeup · Nails', 22, avatarY + 73);
  ctx.fillStyle = 'rgba(110,180,255,0.95)';
  ctx.fillText('luxestudio.salon — book & explore', 22, avatarY + 90);
  ctx.restore();

  // Highlight row.
  const highY = 300;
  ['Hair', 'Skin', 'Makeup', 'Nails'].forEach((label, index) => {
    const cx = 48 + index * 82;
    ctx.save();
    ctx.strokeStyle = 'rgba(230,194,122,0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, highY, 25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    editorialArt(ctx, cx - 21, highY - 21, 42, 42, {
      variant: ['silk', 'glass', 'gold', 'pearl'][index],
      tone: ['champagne', 'ivory', 'charcoal', 'rose'][index],
      radius: 21,
      seed: 71 + index
    });
    ctx.fillStyle = 'rgba(242,244,247,0.6)';
    ctx.font = `400 8px ${FONT.sans}`;
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, highY + 38);
    ctx.textAlign = 'left';
  });

  // Profile tabs.
  const tabs = ['grid', 'instagram', 'user'];
  tabs.forEach((name, index) => {
    icon(ctx, name, 46 + index * 150, 368, 18, index === 0 ? '#F2F4F7' : 'rgba(242,244,247,0.35)', 1.6);
  });
  ctx.strokeStyle = '#F2F4F7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(34, 394);
  ctx.lineTo(62, 394);
  ctx.stroke();
  divider(ctx, 0, 396, UI_W, 'rgba(255,255,255,0.08)');

  // Photo grid.
  const gridY = 404;
  const cell = (UI_W - 8) / 3;
  const variants = ['silk', 'gold', 'pearl', 'glass', 'bloom', 'silk'];
  const tones = ['charcoal', 'ivory', 'rose', 'champagne', 'charcoal', 'rose'];
  for (let i = 0; i < 9; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    editorialArt(ctx, col * (cell + 3) + 1, gridY + row * (cell + 3), cell, cell, {
      variant: variants[i % variants.length],
      tone: tones[i % tones.length],
      radius: 2,
      seed: 91 + i
    });
  }

  // Bottom tab bar.
  ctx.fillStyle = 'rgba(13,15,19,0.96)';
  ctx.fillRect(0, UI_H - 62, UI_W, 62);
  divider(ctx, 0, UI_H - 62, UI_W, 'rgba(255,255,255,0.08)');
  icon(ctx, 'instagram', 30, UI_H - 44, 20, 'rgba(242,244,247,0.85)', 1.6);
  icon(ctx, 'grid', 112, UI_H - 44, 20, 'rgba(242,244,247,0.85)', 1.6);
  icon(ctx, 'message', 194, UI_H - 44, 20, 'rgba(242,244,247,0.85)', 1.6);
  icon(ctx, 'user', 276, UI_H - 44, 20, 'rgba(242,244,247,0.85)', 1.6);

  statusBar(ctx, { dark: true, time: '9:41' });
  ctx.restore();
}
