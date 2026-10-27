// The reel's timeline. Everything on screen and in the score is derived from
// these numbers, so timing stays in sync between picture, sound and tests.

export const DURATION = 58.0;
export const BPM = 120;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;

export const SCENES = [
  { id: 1, key: 'beginning', title: 'A new business begins', start: 0.0, end: 5.6 },
  { id: 2, key: 'discovery', title: 'The customer discovers the business', start: 5.6, end: 11.2 },
  { id: 3, key: 'build', title: 'Manveon builds the website', start: 11.2, end: 17.2 },
  { id: 4, key: 'explore', title: 'Let the viewer explore the website', start: 17.2, end: 26.2 },
  { id: 5, key: 'booking', title: 'From browsing to booking', start: 26.2, end: 35.2 },
  { id: 6, key: 'smarter', title: 'Smarter digital features', start: 35.2, end: 42.8 },
  { id: 7, key: 'owner', title: 'The business owner’s side', start: 42.8, end: 47.6 },
  { id: 8, key: 'ecosystem', title: 'The complete digital experience', start: 47.6, end: 52.6 },
  { id: 9, key: 'reveal', title: 'The Manveon reveal', start: 52.6, end: DURATION }
];

// On-screen captions, in the exact wording of the brief. `stack` captions
// accumulate as a list instead of replacing each other.
export const CAPTIONS = [
  { from: 0.45, to: 2.95, text: 'EVERY GREAT BUSINESS STARTS WITH A VISION.', scene: 1 },
  { from: 3.25, to: 5.5, text: 'BUT HOW DOES THE WORLD DISCOVER IT?', scene: 1 },

  { from: 5.85, to: 8.2, text: 'FROM SOCIAL MEDIA…', scene: 2 },
  { from: 8.45, to: 11.1, text: '…TO A DIGITAL HOME OF ITS OWN.', scene: 2 },

  { from: 12.6, to: 16.9, text: 'MANVEON TURNS YOUR VISION INTO A DIGITAL EXPERIENCE.', scene: 3 },

  { from: 17.55, to: 20.25, text: 'SHOWCASE YOUR SERVICES.', scene: 4 },
  { from: 20.5, to: 22.9, text: 'MAKE INFORMATION EASY TO FIND.', scene: 4 },
  { from: 23.1, to: 26.0, text: 'GIVE CUSTOMERS A REASON TO CHOOSE YOU.', scene: 4 },

  { from: 26.6, to: 29.4, text: 'MAKE BOOKING SIMPLE.', scene: 5 },
  { from: 29.8, to: 34.9, text: 'TURN INTEREST INTO ACTION.', scene: 5 },

  { from: 35.55, to: 38.85, text: 'AI THAT HELPS ANSWER QUESTIONS.', scene: 6 },
  { from: 39.25, to: 42.6, text: 'AUTOMATION THAT REDUCES REPETITIVE WORK.', scene: 6 },

  { from: 43.15, to: 47.35, text: 'AND A MORE ORGANISED WAY TO RUN YOUR BUSINESS.', scene: 7 },

  { from: 47.85, to: 52.45, text: 'ONE BUSINESS.', scene: 8, stack: true },
  { from: 49.25, to: 52.45, text: 'THE RIGHT DIGITAL SOLUTIONS.', scene: 8, stack: true },
  { from: 50.75, to: 52.45, text: 'BUILT AROUND YOUR NEEDS.', scene: 8, stack: true }
];

// The final card, revealed line by line on top of the Manveon wordmark.
export const FINAL = {
  brand: 'MANVEON',
  tagline: ['YOU BRING THE VISION.', "WE BUILD WHAT'S NEXT."],
  services: 'WEBSITES · APPLICATIONS · AI · AUTOMATION · CUSTOM DIGITAL SOLUTIONS',
  era: 'BUILT FOR THE NEXT ERA',
  url: 'manveon.com',
  times: { brand: 53.3, tagline: 54.15, services: 55.2, era: 56.0, url: 56.65 }
};

// Interaction cues. Scenes use these to pose the UI and the score uses them to
// place interface sounds exactly on the action.
export const CUES = {
  phoneLift: 4.15,
  socialScroll: 6.4,
  socialTap: 7.35,
  socialLink: 8.35,
  siteLoad: 9.05,
  assemble: 11.35,
  homeReady: 14.9,

  exploreTap: 19.0,
  servicesScroll: 19.3,
  makeupTap: 21.05,
  makeupScroll: 21.95,
  menuTap: 24.35,
  menuBook: 26.0,

  servicePick: 26.95,
  datePick: 28.05,
  timePick: 29.15,
  typeStart: 29.5,
  typeEnd: 30.7,
  continueTap: 31.0,
  submit: 31.65,
  confirmed: 32.05,

  ask: 35.85,
  answer: 36.8,
  chip: 37.45,
  notifOne: 38.45,
  notifTwo: 39.6,
  chain: 40.15,

  requestOpen: 44.15,
  markConfirmed: 45.55,
  statusDone: 46.0,

  drop: 47.6,
  logo: 53.3,
  tagline: 54.15
};

// Interface sounds for the score, in time order.
export const SFX = [
  { t: 0.15, kind: 'riser', gain: 0.35, length: 2.4 },
  { t: CUES.phoneLift, kind: 'whoosh', gain: 0.3 },
  { t: CUES.socialScroll, kind: 'swipe', gain: 0.28 },
  { t: CUES.socialTap, kind: 'tap', gain: 0.35 },
  { t: CUES.socialLink, kind: 'tap', gain: 0.35 },
  { t: CUES.siteLoad, kind: 'whoosh', gain: 0.32 },
  { t: CUES.assemble, kind: 'riser', gain: 0.4, length: 2.2 },
  { t: CUES.homeReady, kind: 'chime', gain: 0.32 },
  { t: CUES.exploreTap, kind: 'tap', gain: 0.36 },
  { t: CUES.servicesScroll, kind: 'swipe', gain: 0.3 },
  { t: CUES.makeupTap, kind: 'tap', gain: 0.36 },
  { t: CUES.makeupScroll, kind: 'swipe', gain: 0.3 },
  { t: CUES.menuTap, kind: 'tap', gain: 0.34 },
  { t: CUES.menuBook, kind: 'tap', gain: 0.36 },
  { t: CUES.servicePick, kind: 'tap', gain: 0.34 },
  { t: CUES.datePick, kind: 'tap', gain: 0.34 },
  { t: CUES.timePick, kind: 'tap', gain: 0.34 },
  { t: CUES.continueTap, kind: 'tap', gain: 0.34 },
  { t: CUES.submit, kind: 'tap', gain: 0.4 },
  { t: CUES.confirmed, kind: 'chime', gain: 0.36 },
  { t: CUES.ask, kind: 'tap', gain: 0.34 },
  { t: CUES.answer, kind: 'pop', gain: 0.28 },
  { t: CUES.chip, kind: 'tap', gain: 0.3 },
  { t: CUES.notifOne, kind: 'notify', gain: 0.4 },
  { t: CUES.notifTwo, kind: 'notify', gain: 0.34 },
  { t: CUES.chain, kind: 'whoosh', gain: 0.26 },
  { t: CUES.requestOpen, kind: 'tap', gain: 0.34 },
  { t: CUES.markConfirmed, kind: 'tap', gain: 0.36 },
  { t: CUES.statusDone, kind: 'chime', gain: 0.34 },
  { t: CUES.drop, kind: 'impact', gain: 0.5 },
  { t: CUES.logo, kind: 'impact', gain: 0.42 },
  { t: CUES.logo + 0.12, kind: 'chime', gain: 0.3 },
  { t: CUES.tagline + 0.05, kind: 'pop', gain: 0.24 }
];

export function sceneAt(time) {
  return SCENES.find((scene) => time >= scene.start && time < scene.end) || SCENES[SCENES.length - 1];
}
