/* ============================================================
   render.js — renders reel.html frame-by-frame through headless
   Chrome over CDP, into JPEG frames for ffmpeg.
   Usage: node render.js [fps] [outDir]
   ============================================================ */
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CHROME = '/home/vercel-sandbox/.agent-browser/browsers/chrome-156.0.8078.47/chrome';
const FPS = Number(process.argv[2] || 30);
const OUT = process.argv[3] || '/tmp/reel-frames';
const DURATION = 30;
const TOTAL = Math.round(DURATION * FPS);
const PAGE = 'file://' + path.resolve(__dirname, 'reel.html');

function getJSON(url) {
  return new Promise((res, rej) => {
    http.get(url, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } });
    }).on('error', rej);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* minimal CDP websocket client on Node's global WebSocket */
function cdp(wsURL) {
  let id = 0;
  const pending = new Map();
  const ws = new WebSocket(wsURL);
  let onEvent = () => {};
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { res, rej } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
    } else if (msg.method) onEvent(msg);
  });
  const ready = new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  const call = (method, params = {}) => new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  return { ready, call, set onEvent(fn) { onEvent = fn; }, close: () => ws.close() };
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  console.log('launching chrome…');
  const chrome = spawn(CHROME, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1080,1920',
    `--remote-debugging-port=9333`,
    '--user-data-dir=/tmp/reel-chrome-profile',
    'about:blank',
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  console.log('chrome pid', chrome.pid);

  let browser;
  for (let i = 0; i < 60; i++) {
    try { browser = await getJSON('http://127.0.0.1:9333/json/version'); break; }
    catch { await sleep(500); }
  }
  if (!browser) throw new Error('chrome did not expose CDP');

  const targets = await getJSON('http://127.0.0.1:9333/json/list');
  const page = targets.find(t => t.type === 'page');
  const ws = cdp(page.webSocketDebuggerUrl);
  await ws.ready;
  await ws.call('Page.enable');
  await ws.call('Runtime.enable');
  await ws.call('Emulation.setDeviceMetricsOverride', {
    width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false,
  });
  await ws.call('Page.navigate', { url: PAGE });
  await sleep(2500);

  // sanity check: renderer + fonts loaded
  const chk = await ws.call('Runtime.evaluate', {
    expression: `({ok: typeof window.__seek === 'function', fonts: document.fonts.status})`,
    returnByValue: true,
  });
  console.log('renderer check:', JSON.stringify(chk.result.value));
  if (!chk.result.value.ok) throw new Error('renderer not loaded');

  const MAXF = Number(process.env.MAX_FRAMES || TOTAL);
  const t0 = Date.now();
  for (let f = 0; f < Math.min(TOTAL, MAXF); f++) {
    const t = f / FPS;
    const ev = await ws.call('Runtime.evaluate', { expression: `window.__seek(${t.toFixed(4)})` });
    if (ev.exceptionDetails) throw new Error('render error at t=' + t + ': ' + JSON.stringify(ev.exceptionDetails.exception));
    const shot = await ws.call('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
    fs.writeFileSync(path.join(OUT, `f${String(f).padStart(5, '0')}.jpg`), Buffer.from(shot.data, 'base64'));
    if (f % 60 === 0) {
      const dt = (Date.now() - t0) / 1000;
      console.log(`frame ${f}/${TOTAL}  (${dt.toFixed(0)}s elapsed, ${(f / Math.max(dt, 0.01)).toFixed(1)} fps)`);
    }
  }
  console.log(`done: ${TOTAL} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  ws.close();
  chrome.kill('SIGTERM');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
