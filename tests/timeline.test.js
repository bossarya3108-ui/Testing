import test from 'node:test';
import assert from 'node:assert/strict';
import { DURATION, SCENES, CAPTIONS, FINAL, CUES, SFX, sceneAt } from '../src/timeline.js';
import { STUDIO } from '../src/content.js';

test('the reel is between 50 and 60 seconds', () => {
  assert.ok(DURATION >= 50 && DURATION <= 60, `duration ${DURATION}`);
});

test('scenes are contiguous and cover the whole timeline', () => {
  assert.equal(SCENES[0].start, 0);
  assert.equal(SCENES.at(-1).end, DURATION);
  for (let i = 1; i < SCENES.length; i += 1) {
    assert.equal(SCENES[i].start, SCENES[i - 1].end, `gap before scene ${SCENES[i].id}`);
  }
  for (const scene of SCENES) {
    assert.ok(scene.end > scene.start);
  }
});

test('every scene of the brief has on-screen text', () => {
  const required = [
    'EVERY GREAT BUSINESS STARTS WITH A VISION.',
    'BUT HOW DOES THE WORLD DISCOVER IT?',
    'FROM SOCIAL MEDIA…',
    '…TO A DIGITAL HOME OF ITS OWN.',
    'MANVEON TURNS YOUR VISION INTO A DIGITAL EXPERIENCE.',
    'SHOWCASE YOUR SERVICES.',
    'MAKE INFORMATION EASY TO FIND.',
    'GIVE CUSTOMERS A REASON TO CHOOSE YOU.',
    'MAKE BOOKING SIMPLE.',
    'TURN INTEREST INTO ACTION.',
    'AI THAT HELPS ANSWER QUESTIONS.',
    'AUTOMATION THAT REDUCES REPETITIVE WORK.',
    'AND A MORE ORGANISED WAY TO RUN YOUR BUSINESS.',
    'ONE BUSINESS.',
    'THE RIGHT DIGITAL SOLUTIONS.',
    'BUILT AROUND YOUR NEEDS.'
  ];
  const texts = CAPTIONS.map((caption) => caption.text);
  for (const text of required) {
    assert.ok(texts.includes(text), `missing caption: ${text}`);
  }
});

test('captions sit inside their scene and stay long enough to read', () => {
  for (const caption of CAPTIONS) {
    const scene = SCENES.find((entry) => entry.id === caption.scene);
    assert.ok(scene, `unknown scene ${caption.scene}`);
    assert.ok(caption.from >= scene.start, `caption starts before scene: ${caption.text}`);
    assert.ok(caption.to <= scene.end, `caption ends after scene: ${caption.text}`);
    assert.ok(caption.to - caption.from >= 1.0, `caption too short: ${caption.text}`);
  }
});

test('non-stacked captions never overlap', () => {
  const plain = CAPTIONS.filter((caption) => !caption.stack).sort((a, b) => a.from - b.from);
  for (let i = 1; i < plain.length; i += 1) {
    const gap = plain[i].from - plain[i - 1].to;
    assert.ok(gap >= 0, `captions overlap near ${plain[i].from}s`);
    assert.ok(gap > 0.1 || plain[i].scene !== plain[i - 1].scene, `captions too close at ${plain[i].from}s`);
  }
});

test('the final card carries the full Manveon statement', () => {
  assert.equal(FINAL.brand, 'MANVEON');
  assert.deepEqual(FINAL.tagline, ['YOU BRING THE VISION.', "WE BUILD WHAT'S NEXT."]);
  assert.equal(FINAL.services, 'WEBSITES · APPLICATIONS · AI · AUTOMATION · CUSTOM DIGITAL SOLUTIONS');
  assert.equal(FINAL.era, 'BUILT FOR THE NEXT ERA');
  assert.equal(FINAL.url, 'manveon.com');
  const times = Object.values(FINAL.times);
  for (const value of times) {
    assert.ok(value >= 52.6 && value <= DURATION, `final copy at ${value}s`);
  }
  assert.ok(FINAL.times.brand < FINAL.times.tagline);
  assert.ok(FINAL.times.tagline < FINAL.times.services);
});

test('no invented claims, testimonials or guaranteed bookings', () => {
  const copy = [
    ...CAPTIONS.map((caption) => caption.text),
    ...Object.values(FINAL).flat().join(' '),
    JSON.stringify(STUDIO)
  ]
    .join(' ')
    .toLowerCase();
  const banned = [
    'guarantee',
    'guaranteed',
    'revenue',
    'roi',
    'testimonial',
    'growth',
    '10x',
    'award-winning',
    'best salon',
    'instantly booked',
    'sold out'
  ];
  for (const word of banned) {
    assert.ok(!copy.includes(word), `found disallowed claim: ${word}`);
  }
  // The request flow must always say confirmation is still needed.
  assert.match(STUDIO.booking.chosenTime, /AM|PM/);
});

test('cues and sound effects stay inside the timeline and in order', () => {
  for (const [name, value] of Object.entries(CUES)) {
    assert.ok(value >= 0 && value <= DURATION, `cue ${name} at ${value}`);
  }
  assert.ok(CUES.drop > CUES.confirmed && CUES.drop < CUES.logo);
  let previous = -1;
  for (const event of SFX) {
    assert.ok(event.t >= 0 && event.t <= DURATION, `sfx at ${event.t}`);
    assert.ok(event.t >= previous, `sfx out of order at ${event.t}`);
    assert.ok(event.gain > 0 && event.gain <= 1);
    previous = event.t;
  }
});

test('scene lookup returns the right scene at boundaries', () => {
  assert.equal(sceneAt(0).key, 'beginning');
  assert.equal(sceneAt(SCENES[1].start).key, 'discovery');
  assert.equal(sceneAt(DURATION - 0.001).key, 'reveal');
});

test('salon content matches the brief', () => {
  assert.deepEqual(
    STUDIO.services.map((service) => service.name),
    ['Hair Styling', 'Skin Care', 'Makeup', 'Nail Services']
  );
  for (const service of STUDIO.services) {
    assert.ok(service.from > 0, `${service.name} needs a price`);
  }
  assert.equal(STUDIO.makeup.packages.length, 3);
  for (const pack of STUDIO.makeup.packages) {
    assert.ok(pack.price > 0);
    assert.match(pack.duration, /min/);
  }
  assert.equal(STUDIO.booking.steps.length, 5);
  assert.ok(STUDIO.booking.dates.some((date) => `${date.label} ${date.day}` === STUDIO.booking.chosenDate));
  assert.ok(STUDIO.booking.times.includes(STUDIO.booking.chosenTime));
  assert.equal(STUDIO.dashboard.rows.length, 3);
  for (const row of STUDIO.dashboard.rows) {
    assert.ok(row.phone && row.email && row.service && row.when);
  }
  assert.match(STUDIO.assistant.answer, /\$\d+/);
});
