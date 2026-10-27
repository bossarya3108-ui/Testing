// The optional AI concierge on the Luxe Studio website.
import { alpha, fillRR, strokeRR, drawTracked, measureTracked, clamp, glow } from '../draw.js';
import { SALON, FONT, MANVEON } from '../theme.js';
import { UI_W, UI_H, statusBar, icon, chip } from './primitives.js';
import { STUDIO } from '../content.js';

function bubble(ctx, x, y, text, opts = {}) {
  const { fromMe = false, maxWidth = 268, appear = 1, size = 10.5 } = opts;
  if (appear <= 0) return 0;
  ctx.save();
  ctx.globalAlpha = clamp(appear);
  const pad = 14;
  ctx.font = `400 ${size}px ${FONT.sans}`;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (measureTracked(ctx, next, 0) > maxWidth - pad * 2 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  const height = lines.length * (size * 1.45) + pad * 1.5;
  const width = Math.min(
    maxWidth,
    Math.max(...lines.map((l) => measureTracked(ctx, l, 0))) + pad * 2
  );
  const bx = fromMe ? UI_W - 20 - width : 20;
  fillRR(ctx, bx, y, width, height, 14, fromMe ? SALON.black : '#FFFFFF');
  if (!fromMe) strokeRR(ctx, bx, y, width, height, 14, SALON.line, 1);
  ctx.fillStyle = fromMe ? SALON.white : 'rgba(21,18,15,0.82)';
  lines.forEach((textLine, index) => {
    ctx.fillText(textLine, bx + pad, y + pad + 1 + index * size * 1.45);
  });
  ctx.restore();
  return height;
}

export function drawAssistant(ctx, state) {
  const { typedQuestion = 0, sent = 0, answer = 0, chips = 0, time = 0 } = state;
  ctx.save();
  ctx.fillStyle = SALON.ivoryWarm;
  ctx.fillRect(0, 0, UI_W, UI_H);

  // Header: status bar, concierge name and live indicator.
  ctx.fillStyle = '#0A121C';
  ctx.fillRect(0, 0, UI_W, 140);
  statusBar(ctx, { dark: true, time: '9:46' });
  icon(ctx, 'back', 24, 72, 17, SALON.ivory, 1.6);
  ctx.fillStyle = SALON.ivory;
  ctx.font = `600 12px ${FONT.semi}`;
  ctx.textAlign = 'center';
  drawTracked(ctx, 'LUXE CONCIERGE', UI_W / 2, 78, 1.8, 'center');
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.font = `400 7.5px ${FONT.sans}`;
  ctx.fillText('AI ASSISTANT · DEMO', UI_W / 2, 94);
  ctx.textAlign = 'left';
  glow(ctx, UI_W - 34, 76, 18, MANVEON.lime, 0.45);
  ctx.fillStyle = MANVEON.lime;
  ctx.beginPath();
  ctx.arc(UI_W - 34, 76, 3.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = SALON.taupe;
  ctx.font = `500 7px ${FONT.semi}`;
  drawTracked(ctx, 'TODAY · 9:46 AM', UI_W / 2, 170, 1.6, 'center');
  ctx.textAlign = 'left';

  let y = 188;
  y += bubble(ctx, 20, y, STUDIO.assistant.greeting, { appear: 1 }) + 10;

  if (sent > 0) {
    y += bubble(ctx, 20, y, STUDIO.assistant.question, {
      fromMe: true,
      appear: clamp(sent * 2.2),
      maxWidth: 250
    }) + 10;
  }

  if (answer > 0) {
    const typing = clamp(answer * 3.2);
    if (typing < 1) {
      fillRR(ctx, 20, y, 58, 34, 14, '#FFFFFF');
      strokeRR(ctx, 20, y, 58, 34, 14, SALON.line, 1);
      for (let i = 0; i < 3; i += 1) {
        ctx.fillStyle = alpha(SALON.taupe, 0.4 + 0.4 * Math.sin(time * 8 + i));
        ctx.beginPath();
        ctx.arc(38 + i * 11, y + 17, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      y += 44;
    } else {
      y += bubble(ctx, 20, y, STUDIO.assistant.answer, { appear: clamp((answer - 0.3) * 2) }) + 10;
    }
  }

  if (chips > 0) {
    ctx.save();
    ctx.globalAlpha = clamp(chips);
    ctx.translate(0, (1 - clamp(chips)) * 8);
    let cx = 20;
    STUDIO.assistant.chips.forEach((label) => {
      ctx.font = `500 9.5px ${FONT.medium}`;
      const w = measureTracked(ctx, label, 0) + 30;
      chip(ctx, cx, y, w, 28, label, { active: false, size: 9.5 });
      cx += w + 8;
    });
    ctx.restore();
    y += 46;
  }

  // Follow-up suggestions give the conversation a real product feel.
  if (chips > 0.4) {
    const fade = clamp((chips - 0.4) / 0.6);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.fillStyle = SALON.taupe;
    ctx.font = `600 7px ${FONT.semi}`;
    drawTracked(ctx, 'TRY ASKING', 22, y + 8, 1.8);
    const questions = [
      'What are your makeup prices?',
      'Where are you located?'
    ];
    questions.forEach((question, index) => {
      const rowY = y + 22 + index * 44;
      fillRR(ctx, 20, rowY, UI_W - 40, 36, 10, 'rgba(255,255,255,0.6)');
      strokeRR(ctx, 20, rowY, UI_W - 40, 36, 10, SALON.line, 1);
      icon(ctx, 'message', 30, rowY + 10, 15, SALON.taupe, 1.4);
      ctx.fillStyle = 'rgba(21,18,15,0.72)';
      ctx.font = `400 10px ${FONT.sans}`;
      ctx.fillText(question, 54, rowY + 22);
      icon(ctx, 'chevron', UI_W - 38, rowY + 11, 13, SALON.taupe, 1.3);
    });
    ctx.restore();
  }

  // Booking shortcut appears once the assistant has answered.
  const ctaY = UI_H - 212;
  const ctaFade = clamp((chips - 0.2) / 0.8);
  if (ctaFade > 0) {
  ctx.save();
  ctx.globalAlpha = ctaFade;
  ctx.translate(0, (1 - ctaFade) * 10);
  fillRR(ctx, 20, ctaY, UI_W - 40, 86, 14, '#0A121C');
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = `500 11.5px ${FONT.semi}`;
  ctx.fillText('Ready to book?', 36, ctaY + 32);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = `400 8.5px ${FONT.sans}`;
  ctx.fillText('Request a time — the studio confirms it.', 36, ctaY + 48);
  fillRR(ctx, UI_W - 116, ctaY + 24, 80, 32, 16, MANVEON.lime);
  ctx.fillStyle = '#06121C';
  ctx.font = `600 9.5px ${FONT.semi}`;
  ctx.textAlign = 'center';
  ctx.fillText('Book', UI_W - 76, ctaY + 45);
  ctx.textAlign = 'left';
  ctx.restore();
  }

  // Source note keeps the assistant honest.
  ctx.fillStyle = 'rgba(21,18,15,0.4)';
  ctx.font = `400 7.5px ${FONT.sans}`;
  ctx.textAlign = 'center';
  ctx.fillText('Answers are drawn from the salon’s own website content.', UI_W / 2, UI_H - 122);
  ctx.textAlign = 'left';

  // Composer.
  ctx.fillStyle = 'rgba(244,235,221,0.97)';
  ctx.fillRect(0, UI_H - 96, UI_W, 96);
  strokeRR(ctx, 20, UI_H - 78, UI_W - 76, 44, 22, 'rgba(21,18,15,0.12)', 1);
  if (typedQuestion <= 0) {
    ctx.fillStyle = 'rgba(21,18,15,0.35)';
    ctx.font = `400 10px ${FONT.sans}`;
    ctx.fillText('Ask about services, prices or booking…', 38, UI_H - 51);
  }

  if (typedQuestion > 0) {
    ctx.fillStyle = SALON.black;
    ctx.font = `400 10.5px ${FONT.sans}`;
    const shown = STUDIO.assistant.question.slice(0, Math.ceil(clamp(typedQuestion) * STUDIO.assistant.question.length));
    ctx.fillText(shown, 38, UI_H - 51);
    if (typedQuestion < 1) {
      ctx.fillStyle = SALON.champagne;
      ctx.fillRect(38 + measureTracked(ctx, shown, 0) + 1, UI_H - 62, 1.6, 12);
    }
  }

  fillRR(ctx, UI_W - 48, UI_H - 78, 44, 44, 22, SALON.black);
  icon(ctx, 'send', UI_W - 34, UI_H - 66, 16, SALON.white, 1.6);

  fillRR(ctx, UI_W / 2 - 60, UI_H - 18, 120, 5, 2.5, 'rgba(21,18,15,0.35)');
  ctx.restore();
}
