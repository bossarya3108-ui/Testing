# MANVEON — Concept Instagram Reel (30s, 9:16)

A premium, cinematic 30-second vertical Instagram Reel for **MANVEON**,
a technology startup that helps new businesses establish and grow their
digital presence.

The Reel tells the story of a newly launched beauty salon ("Lumière",
fictional) evolving from a physical business with a basic Instagram
presence into a connected digital business experience:

**New business → digital presence → connected customer experience → smarter operations.**

## Final deliverable

- `manveon_reel_30s_9x16.mp4` — 1080×1920 (9:16), exactly 30.00s, 30 fps,
  H.264 + AAC. No voiceover; story is told through visuals, on-screen text,
  music and sound design only.

## Structure

| Scene | Time | Story beat | On-screen text |
|---|---|---|---|
| 1 | 0–4s | The vision — storefront → interior, founder preparing | "A NEW VENTURE. A BIG VISION." |
| 2 | 4–8s | The digital challenge — discovery and fragmented DM enquiries | "HOW WILL CUSTOMERS FIND, TRUST AND BOOK YOU?" |
| 3 | 8–14s | Build a digital home — branded salon website on phone + laptop | "YOUR BUSINESS. YOUR DIGITAL PRESENCE." |
| 4 | 14–21s | Connect the experience — website, AI assistant, booking, customer profile | "WEBSITES / AI ASSISTANTS / AUTOMATION / CONNECTED WORKFLOWS" |
| 5 | 21–26s | The big picture — unified ecosystem + owner with customers | "LESS MANUAL WORK. A MORE CONNECTED BUSINESS." |
| 6 | 26–30s | MANVEON brand reveal | MANVEON · BUILT FOR THE NEXT ERA · manveon.com · "YOU BRING THE VISION. WE BUILD WHAT'S NEXT." |

Compliance notes baked into the edit:

- Scene 4 carries the caption "SOLUTIONS SHAPED AROUND YOUR BUSINESS" —
  features are presented as solutions that can be built per requirements,
  not as a standard bundle.
- The end card carries "CONCEPTUAL DEMONSTRATION · SALON DEPICTED IS
  ILLUSTRATIVE" — no implication of a real Manveon client.
- No testimonials, statistics or performance claims anywhere.
- All critical text sits inside Instagram Reels safe areas.

## How it is built

The Reel is fully code-generated and deterministic (every frame is a pure
function of time):

- `reel.html` + `js/` — a 1080×1920 canvas motion-graphics composition
  (dark navy/charcoal base, electric-blue and lime accents, Inter type,
  film grain, vignette, soft DOF layers, glass UI, animated node graphs).
- `render.js` — renders frames frame-by-frame through headless Chrome over
  the DevTools protocol (`node render.js 30 /tmp/reel-frames`).
- `audio.js` — synthesizes the soundtrack (cinematic electronic build:
  pads, sub bass, four-on-the-floor kick, arpeggios, riser, logo impact,
  plus UI/notification SFX) into a 30s stereo WAV (`node audio.js`).
- Encode: `ffmpeg -framerate 30 -i frames/f%05d.jpg -i audio.wav
  -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -movflags +faststart
  -shortest out.mp4`

`fonts/` contains the Inter woff2 files used by the composition.
