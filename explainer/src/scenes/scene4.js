"use strict";

const D = require("../lib/draw");
const theme = require("../lib/theme");
const { inv, clamp, lerp, smooth, easeOutCubic, easeOutBack, pulse, markerTime, rng } = require("../lib/util");
const { drawSceneTitle, drawGlow } = require("../lib/background");

const C = theme.color;
const W = theme.width;

const CARDS = [
  {
    code: "pacs.008",
    title: "FI-to-FI Customer Credit Transfer",
    desc: "Moves customer payment details between financial institutions.",
    tag: "INSTRUCTION",
    icon: "send",
    color: C.cyan,
    xml: "<CdtTrfTxInf>",
  },
  {
    code: "pacs.009",
    title: "FI-to-FI Credit Transfer",
    desc: "Moves funds between financial institutions.",
    tag: "INSTRUCTION",
    icon: "send",
    color: C.blueSoft,
    xml: "<IntrBkSttlmAmt>",
  },
  {
    code: "pacs.002",
    title: "FI-to-FI Payment Status Report",
    desc: "Communicates the status of a payment.",
    note: "Reports status — it is not a payment instruction.",
    tag: "STATUS",
    icon: "status",
    color: C.green,
    xml: "<TxSts>",
  },
  {
    code: "pacs.004",
    title: "Payment Return",
    desc: "Returns a payment to the sending institution.",
    tag: "RETURN",
    icon: "return",
    color: C.amber,
    xml: "<RtrdIntrBkSttlmAmt>",
  },
  {
    code: "camt.056",
    title: "FI-to-FI Payment Cancellation Request",
    desc: "Requests cancellation of a payment.",
    note: "A request — not an automatic cancellation.",
    tag: "REQUEST",
    icon: "cancel",
    color: "#ff9b5e",
    xml: "<CxlRsn>",
  },
];

const ROWS = [
  { label: "Payment instruction", sub: "Customer or bank transfer", icon: "send", color: C.cyan, tag: "INSTRUCTION" },
  { label: "Status response", sub: "Reports status, not an instruction", icon: "status", color: C.green, tag: "STATUS" },
  { label: "Return", sub: "Returns funds to the sender", icon: "return", color: C.amber, tag: "RETURN" },
  { label: "Cancellation request", sub: "Request — not automatic", icon: "cancel", color: "#ff9b5e", tag: "REQUEST" },
];

const CARD_X = 80;
const CARD_Y = 270;
const CARD_W = 950;
const CARD_H = 108;
const CARD_GAP = 12;

const PANEL = { x: 1090, y: 260, w: 750, h: 610 };

const CODE_LINES = [
  ["<Document>", C.cyanSoft, 0],
  ["  <FIToFICstmrCdtTrf>", C.blueSoft, 0],
  ["    <GrpHdr>", C.blueSoft, 0],
  ["      <MsgId>GPP-2026-004182</MsgId>", C.muted, 0],
  ["      <CreDtTm>2026-04-18T09:42:11Z</CreDtTm>", C.muted, 0],
  ["    </GrpHdr>", C.blueSoft, 0],
  ["    <CdtTrfTxInf>", C.blueSoft, 0],
  ["      <IntrBkSttlmAmt Ccy=\"USD\">25,000.00</...>", C.ink, 0],
  ["      <Cdtr><Nm>BENEFICIARY LTD</Nm></Cdtr>", C.muted, 0],
  ["    </CdtTrfTxInf>", C.blueSoft, 0],
  ["  </FIToFICstmrCdtTrf>", C.blueSoft, 0],
  ["</Document>", C.cyanSoft, 0],
];

function revealTimes(scene) {
  return [
    markerTime(scene, "pacs008", 9.7) - 0.35,
    markerTime(scene, "pacs009", 13.87) - 0.35,
    markerTime(scene, "pacs002", 17.7) - 0.35,
    markerTime(scene, "pacs004", 19.78) - 0.35,
    markerTime(scene, "camt056", 21.9) - 0.35,
  ];
}

function focusAt(t, reveals) {
  if (t >= 27.3) return 5;
  if (t >= reveals[4] + 0.3) return 4;
  if (t >= reveals[3] + 0.3) return 3;
  if (t >= reveals[2] + 0.3) return 2;
  if (t >= reveals[1] + 0.3) return 1;
  if (t >= reveals[0] + 0.3) return 0;
  return -1;
}

function drawBackgroundCode(ctx, t) {
  const rand = rng(4042026);
  const snippets = [
    "<MsgId>", "<IntrBkSttlmAmt>", "Ccy=\"USD\"", "<TxSts>",
    "<CdtTrfTxInf>", "<GrpHdr>", "pacs.008", "ISO 20022",
  ];
  snippets.forEach((s, i) => {
    const x = 60 + rand() * (W - 160);
    const y = 220 + rand() * 620;
    const a = 0.05 + 0.03 * (0.5 + 0.5 * Math.sin(t * 0.4 + i));
    D.text(ctx, s, x, y + Math.sin(t * 0.2 + i) * 8, {
      size: 11,
      family: "mono",
      weight: 400,
      color: i % 3 === 0 ? C.cyan : C.blueSoft,
      alpha: a,
      letterSpacing: 0.4,
    });
  });
}

function drawCard(ctx, card, i, x, y, appear, active, alpha) {
  if (appear <= 0.001) return;
  const a = clamp(appear);
  const scale = 0.96 + 0.04 * easeOutBack(a, 1.1);
  const slide = (1 - easeOutCubic(a)) * 26;
  ctx.save();
  ctx.globalAlpha *= a * alpha;
  ctx.translate(x + CARD_W / 2, y + CARD_H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(x + CARD_W / 2), -(y + CARD_H / 2));

  const px = x + slide;
  D.panel(ctx, px, y, CARD_W, CARD_H, {
    fillTop: active ? "rgba(17, 42, 74, 0.97)" : "rgba(10, 25, 45, 0.95)",
    fillBottom: active ? "rgba(8, 22, 43, 0.98)" : "rgba(5, 15, 29, 0.96)",
    stroke: active ? D.hexAlpha(card.color, 0.55) : "rgba(96,150,220,0.18)",
    glow: active ? 0.55 : 0,
    glowColor: card.color,
    accent: active ? D.hexAlpha(card.color, 0.55) : null,
    radius: 14,
  });

  D.text(ctx, `0${i + 1}`, px + 18, y + 22, {
    size: 9, family: "mono", weight: 600, color: C.dim, letterSpacing: 1.2,
  });
  D.text(ctx, card.code, px + 50, y + 48, {
    size: 27, family: "mono", weight: 600, color: card.color, letterSpacing: -0.6, baseline: "middle",
  });
  D.text(ctx, "FI → FI", px + 52, y + 76, {
    size: 9, family: "mono", weight: 500, color: C.muted, letterSpacing: 1.4, alpha: 0.85,
  });

  D.text(ctx, card.title, px + 300, y + 38, {
    size: 18, family: "display", weight: 600, color: C.ink, baseline: "middle", letterSpacing: -0.2,
  });
  D.text(ctx, card.desc, px + 300, y + 64, {
    size: 12.5, weight: 400, color: C.muted, baseline: "middle", alpha: 0.92, maxWidth: 390,
  });
  if (card.note) {
    D.text(ctx, card.note, px + 300, y + 85, {
      size: 10.5, weight: 500, color: card.color, baseline: "middle", alpha: 0.9,
    });
  }

  D.text(ctx, card.xml, px + 712, y + 58, {
    size: 10.5, family: "mono", weight: 400, color: card.color, alpha: 0.8,
  });

  D.pill(ctx, card.tag, px + CARD_W - 18, y + 26, {
    size: 9, height: 24, padX: 10, color: card.color,
    bg: D.hexAlpha(card.color, 0.1), border: D.hexAlpha(card.color, 0.32),
    align: "right", letterSpacing: 1.2,
  });
  ctx.restore();
}

function drawSlot(ctx, card, i, x, y, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.setLineDash([6, 7]);
  D.roundRectPath(ctx, x, y, CARD_W, CARD_H, 14);
  ctx.strokeStyle = "rgba(96,150,220,0.16)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.setLineDash([]);

  D.text(ctx, `0${i + 1}`, x + 18, y + 22, {
    size: 9, family: "mono", weight: 600, color: C.faint, letterSpacing: 1.2,
  });
  D.icon(ctx, card.icon, x + 52, y + 54, 22, C.faint, { alpha: 0.32, lineWidth: 1.4 });
  D.text(ctx, "MESSAGE TYPE", x + 78, y + 59, {
    size: 9, family: "mono", weight: 500, color: C.faint, letterSpacing: 2, alpha: 0.6,
  });

  // Skeleton text bars.
  ctx.fillStyle = "rgba(96,150,220,0.10)";
  D.roundRectPath(ctx, x + 300, y + 34, 250, 7, 3.5);
  ctx.fill();
  D.roundRectPath(ctx, x + 300, y + 56, 330, 6, 3);
  ctx.fillStyle = "rgba(96,150,220,0.07)";
  ctx.fill();

  D.text(ctx, card.tag, x + CARD_W - 18, y + 26, {
    size: 9, family: "mono", weight: 600, color: card.color,
    align: "right", letterSpacing: 1.2, alpha: 0.55,
  });

  // A slow shimmer to show the slot is waiting.
  const g = ctx.createLinearGradient(x, 0, x + CARD_W, 0);
  g.addColorStop(0, "rgba(53,224,255,0)");
  g.addColorStop(0.5, "rgba(53,224,255,0.025)");
  g.addColorStop(1, "rgba(53,224,255,0)");
  ctx.fillStyle = g;
  D.roundRectPath(ctx, x, y, CARD_W, CARD_H, 14);
  ctx.fill();
  ctx.restore();
}

function drawConceptPanel(ctx, t, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  D.panel(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, {
    fillTop: "rgba(8, 21, 40, 0.9)",
    fillBottom: "rgba(4, 12, 24, 0.94)",
    stroke: "rgba(53,224,255,0.2)",
    radius: 18,
  });

  const isoPulse = pulse(t, 3.0, 0.3, 0.6, 0.8);
  D.text(ctx, "ISO 20022", PANEL.x + 34, PANEL.y + 54, {
    size: 34, family: "mono", weight: 600, color: C.cyanSoft, letterSpacing: -0.5,
  });
  D.text(ctx, "A common, structured language for payment data", PANEL.x + 34, PANEL.y + 80, {
    size: 12.5, weight: 400, color: C.muted, alpha: 0.9,
  });
  D.pill(ctx, "STRUCTURED DATA", PANEL.x + PANEL.w - 34, PANEL.y + 48, {
    size: 9, height: 24, padX: 11, color: C.cyan,
    bg: "rgba(53,224,255,0.08)", border: "rgba(53,224,255,0.3)",
    align: "right", letterSpacing: 1.4, alpha: 0.75 + isoPulse * 0.25,
  });

  // XML window.
  const wx = PANEL.x + 34;
  const wy = PANEL.y + 108;
  const ww = PANEL.w - 68;
  const wh = 326;
  D.panel(ctx, wx, wy, ww, wh, {
    fill: "rgba(3, 10, 20, 0.85)",
    stroke: "rgba(90,162,255,0.16)",
    radius: 12,
  });
  D.rule(ctx, wx, wy + 34, wx + ww, wy + 34, "rgba(96,150,220,0.14)", 1, 1);
  D.dot(ctx, wx + 18, wy + 17, 3, "#ff6b6b", 0.5);
  D.dot(ctx, wx + 30, wy + 17, 3, C.amber, 0.5);
  D.dot(ctx, wx + 42, wy + 17, 3, C.green, 0.5);
  D.text(ctx, "payment.xml", wx + 60, wy + 21, {
    size: 10, family: "mono", weight: 500, color: C.dim, baseline: "middle", letterSpacing: 0.6,
  });

  CODE_LINES.forEach(([line, color], i) => {
    const a = smooth(inv(t, 0.9 + i * 0.12, 1.3 + i * 0.12));
    if (a <= 0.01) return;
    const y = wy + 58 + i * 20.5;
    D.text(ctx, String(i + 1).padStart(2, "0"), wx + 16, y, {
      size: 9.5, family: "mono", weight: 500, color: C.faint, alpha: a * 0.7, baseline: "middle",
    });
    D.text(ctx, line, wx + 48, y, {
      size: 11.5, family: "mono", weight: 400, color, alpha: a * 0.88, baseline: "middle",
    });
  });

  const scan = wy + 58 + ((t * 42) % 240);
  D.scanLine(ctx, wx + 44, scan, ww - 60, C.cyan, 0.25);

  // Concept chips.
  const chips = [
    ["STRUCTURED", "Defined fields"],
    ["SHARED", "Common meaning"],
    ["TRACEABLE", "End-to-end view"],
  ];
  chips.forEach(([label, sub], i) => {
    const a = smooth(inv(t, 5.4 + i * 0.35, 5.9 + i * 0.35));
    const x = PANEL.x + 34 + i * 232;
    const y = PANEL.y + 456;
    ctx.save();
    ctx.globalAlpha *= a;
    D.panel(ctx, x, y, 212, 76, {
      fill: "rgba(10,24,44,0.8)", stroke: "rgba(96,150,220,0.18)", radius: 10,
    });
    D.text(ctx, label, x + 16, y + 26, {
      size: 10, family: "mono", weight: 600, color: C.cyanSoft, letterSpacing: 1.8,
    });
    D.text(ctx, sub, x + 16, y + 50, {
      size: 12, weight: 400, color: C.muted, alpha: 0.9,
    });
    ctx.restore();
  });

  D.text(ctx, "Example structure — field names are illustrative", PANEL.x + 34, PANEL.y + PANEL.h - 24, {
    size: 10, weight: 400, color: C.dim, alpha: 0.6,
  });
  ctx.restore();
}

function drawFlowsPanel(ctx, t, alpha, focus, reveals) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  D.panel(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, {
    fillTop: "rgba(8, 21, 40, 0.92)",
    fillBottom: "rgba(4, 12, 24, 0.95)",
    stroke: "rgba(53,224,255,0.18)",
    radius: 18,
  });
  D.text(ctx, "EXAMPLE FLOWS", PANEL.x + 34, PANEL.y + 44, {
    size: 11, family: "mono", weight: 600, color: C.cyanSoft, letterSpacing: 2.6,
  });
  D.text(ctx, "How the message types relate", PANEL.x + 34, PANEL.y + 68, {
    size: 12, weight: 400, color: C.muted, alpha: 0.85,
  });

  ROWS.forEach((row, i) => {
    const a = smooth(inv(t, 9.5 + i * 0.35, 10.0 + i * 0.35));
    const rowForCard = [0, 0, 1, 2, 3];
    const active = focus === 5 || (focus >= 0 && rowForCard[focus] === i);
    const y = PANEL.y + 104 + i * 112;
    ctx.save();
    ctx.globalAlpha *= a;
    const glow = active ? 0.35 : 0;
    D.panel(ctx, PANEL.x + 34, y, PANEL.w - 68, 96, {
      fillTop: active ? "rgba(16, 40, 70, 0.9)" : "rgba(9, 22, 40, 0.7)",
      fillBottom: active ? "rgba(8, 24, 46, 0.92)" : "rgba(5, 15, 29, 0.7)",
      stroke: active ? D.hexAlpha(row.color, 0.45) : "rgba(96,150,220,0.16)",
      glow,
      glowColor: row.color,
      radius: 12,
    });
    D.icon(ctx, row.icon, PANEL.x + 68, y + 48, 24, row.color, { alpha: active ? 1 : 0.7, lineWidth: 1.6 });
    D.text(ctx, row.label, PANEL.x + 98, y + 39, {
      size: 15.5, weight: 500, color: C.ink, baseline: "middle",
    });
    D.text(ctx, row.sub, PANEL.x + 98, y + 60, {
      size: 10.5, weight: 400, color: C.muted, baseline: "middle", alpha: 0.85,
    });

    // Flow line.
    D.connection(ctx, [[PANEL.x + 330, y + 48], [PANEL.x + 420, y + 48]], {
      color: active ? row.color : "rgba(96,150,220,0.45)",
      alpha: 0.75, width: 1.2, glow: active ? 0.5 : 0, arrow: true, arrowSize: 7,
    });

    // Message pills, introduced with the corresponding card. Unrevealed
    // message types stay as quiet ghosts so the example map reads as a whole.
    const pills = i === 0
      ? [["pacs.008", C.cyan, reveals[0]], ["pacs.009", C.blueSoft, reveals[1]]]
      : i === 1
        ? [["pacs.002", C.green, reveals[2]]]
        : i === 2
          ? [["pacs.004", C.amber, reveals[3]]]
          : [["camt.056", "#ff9b5e", reveals[4]]];

    let px = PANEL.x + 442;
    pills.forEach(([label, color, reveal], j) => {
      const pa = smooth(inv(t, reveal + 0.1, reveal + 0.6));
      const pillAlpha = 0.18 + 0.82 * pa;
      const w = D.pill(ctx, label, px, y + 48, {
        size: 11, height: 30, padX: 11, color,
        bg: D.hexAlpha(color, 0.06 + 0.08 * pa),
        border: D.hexAlpha(color, 0.16 + 0.22 * pa),
        alpha: pillAlpha * (active ? 1 : 0.9), letterSpacing: 0.3,
      });
      px += w + 8;
    });

    D.text(ctx, row.tag, PANEL.x + PANEL.w - 52, y + 48, {
      size: 8.5, family: "mono", weight: 600, color: row.color,
      align: "right", baseline: "middle", letterSpacing: 1.4, alpha: 0.55,
    });

    if (i === 3) {
      D.text(ctx, "A request, not an automatic cancellation", PANEL.x + 442, y + 78, {
        size: 9.5, weight: 500, color: C.amber, alpha: active ? 0.9 : 0.55,
      });
    }
    ctx.restore();
  });

  // Summary footer for the exception-handling message.
  const endA = smooth(inv(t, 27.2, 27.8));
  if (endA > 0.01) {
    ctx.save();
    ctx.globalAlpha *= endA;
    D.pill(ctx, "TRACE THE JOURNEY", PANEL.x + 34, PANEL.y + PANEL.h - 34, {
      size: 9, height: 24, padX: 11, color: C.cyan,
      bg: "rgba(53,224,255,0.07)", border: "rgba(53,224,255,0.25)", letterSpacing: 1.2,
    });
    D.pill(ctx, "INVESTIGATE EXCEPTIONS", PANEL.x + 210, PANEL.y + PANEL.h - 34, {
      size: 9, height: 24, padX: 11, color: C.amber,
      bg: "rgba(255,181,71,0.07)", border: "rgba(255,181,71,0.28)", letterSpacing: 1.2,
    });
    ctx.restore();
  } else {
    D.text(ctx, "Examples — not a mandatory sequence", PANEL.x + 34, PANEL.y + PANEL.h - 36, {
      size: 10, weight: 400, color: C.dim, alpha: 0.6,
    });
  }
  ctx.restore();
}

module.exports = function scene4(ctx, t, scene) {
  const titleA = smooth(inv(t, 0.1, 0.8));
  const reveals = revealTimes(scene);
  const focus = focusAt(t, reveals);
  const panelA = smooth(inv(t, 0.45, 1.15));
  const flowA = smooth(inv(t, 9.0, 9.7));
  const conceptA = 1 - smooth(inv(t, 8.9, 9.5));

  // Background texture.
  drawBackgroundCode(ctx, t);
  drawGlow(ctx, W * 0.78, 520, 900, 0.18);

  drawSceneTitle(ctx, {
    eyebrow: "ISO 20022 MESSAGING",
    title: "Understanding ISO 20022 messages",
    sub: "Five important message types — examples, not a mandatory sequence",
    y: 150,
    alpha: titleA,
  });

  D.text(ctx, "MESSAGE CATALOGUE", CARD_X, 238, {
    size: 10, family: "mono", weight: 600, color: C.dim, letterSpacing: 2.4, alpha: titleA * 0.8,
  });
  D.text(ctx, "05 TYPES", CARD_X + CARD_W, 238, {
    size: 10, family: "mono", weight: 600, color: C.dim, align: "right", letterSpacing: 2.4, alpha: titleA * 0.8,
  });

  // Message slots / cards.
  CARDS.forEach((card, i) => {
    const reveal = reveals[i];
    const appear = inv(t, reveal, reveal + 0.5);
    const active = focus === 5 || focus === i;
    const y = CARD_Y + i * (CARD_H + CARD_GAP);
    const slotA = smooth(inv(t, 0.6 + i * 0.1, 1.2 + i * 0.1)) * (1 - smooth(appear));
    drawSlot(ctx, card, i, CARD_X, y, titleA * slotA * 0.9);
    if (appear > 0.001) {
      drawCard(ctx, card, i, CARD_X, y, appear, active, titleA);
    }
  });

  // Right panel: concept first, then example flows.
  drawConceptPanel(ctx, t, panelA * conceptA);
  drawFlowsPanel(ctx, t, panelA * flowA, focus, reveals);

  // A small annotation during the ISO introduction.
  const introA = smooth(inv(t, 2.6, 3.3)) * (1 - smooth(inv(t, 8.6, 9.2)));
  if (introA > 0.01) {
    D.text(ctx, "ISO 20022 defines the structure — GPP works with the messages flowing through the platform", CARD_X, 886, {
      size: 11.5, weight: 400, color: C.muted, alpha: introA * 0.75,
    });
  }
};
