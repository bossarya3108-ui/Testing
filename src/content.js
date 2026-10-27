// All fictional Luxe Studio content lives here so the website UI, the booking
// flow, the owner dashboard and the tests agree on a single source of truth.
export const STUDIO = {
  name: 'Luxe Studio',
  tagline: 'Beauty & Salon',
  address: '128 Halcyon Lane',
  area: 'Halcyon Quarter',
  hours: 'Tue–Sat · 9am–7pm',
  phone: '+1 (415) 555-0142',
  email: 'hello@luxestudio.example',
  instagram: 'luxestudio.salon',
  hero: {
    title: 'Beauty, refined.',
    body: 'Hair, skin, makeup and nails in the heart of the city.'
  },
  services: [
    { id: 'hair', name: 'Hair Styling', from: 65, blurb: 'Precision cuts, colour and finishing.' },
    { id: 'skin', name: 'Skin Care', from: 80, blurb: 'Facials and treatments for calm, lit skin.' },
    { id: 'makeup', name: 'Makeup', from: 95, blurb: 'Soft, sculpted looks for any occasion.' },
    { id: 'nails', name: 'Nail Services', from: 45, blurb: 'Considered manicures and pedicures.' }
  ],
  featured: [
    { name: 'Signature Glow', detail: 'Makeup · 60 min', price: 120 },
    { name: 'Precision Cut & Finish', detail: 'Hair Styling · 75 min', price: 95 },
    { name: 'Calm Skin Facial', detail: 'Skin Care · 50 min', price: 110 }
  ],
  makeup: {
    name: 'Makeup',
    intro: 'Skin-first artistry, built for daylight and for the camera.',
    packages: [
      { name: 'Signature Glow', duration: '60 min', price: 120 },
      { name: 'Evening Editorial', duration: '75 min', price: 150 },
      { name: 'Bridal Artistry', duration: '120 min', price: 260 }
    ]
  },
  booking: {
    steps: ['Service', 'Date', 'Time', 'Details', 'Review'],
    dates: [
      { label: 'Thu', day: '13' },
      { label: 'Fri', day: '14' },
      { label: 'Sat', day: '15' },
      { label: 'Mon', day: '17' }
    ],
    times: ['9:30 AM', '11:30 AM', '1:00 PM', '3:30 PM', '5:00 PM'],
    customer: { name: 'Aisha Khan', phone: '(415) 555-0188', email: 'aisha.k@example.com' },
    chosenDate: 'Fri 14',
    chosenTime: '11:30 AM',
    reference: 'LS-2481'
  },
  assistant: {
    greeting: 'Hi, I’m the Luxe concierge. Ask me about services, prices or booking.',
    question: 'What services do you offer?',
    answer: 'We offer hair styling, skin care, makeup and nail services. Makeup starts at $95.',
    chips: ['Prices', 'Location', 'Book']
  },
  notifications: [
    {
      title: 'Request received',
      body: 'Signature Glow · Fri 14 at 11:30 AM. Luxe Studio will confirm shortly.',
      time: 'now'
    },
    {
      title: 'Reminder',
      body: 'We’ll text you as soon as Luxe Studio confirms your request.',
      time: '2m'
    }
  ],
  dashboard: {
    tabs: ['Enquiries', 'Requests', 'Confirmed'],
    rows: [
      {
        name: 'Aisha Khan',
        service: 'Signature Glow',
        when: 'Fri 14 · 11:30 AM',
        status: 'New request',
        phone: '(415) 555-0188',
        email: 'aisha.k@example.com'
      },
      {
        name: 'Mira Patel',
        service: 'Hair Styling',
        when: 'Sat 15 · 1:00 PM',
        status: 'Awaiting confirmation',
        phone: '(415) 555-0121',
        email: 'mira.p@example.com'
      },
      {
        name: 'Sofia Reyes',
        service: 'Nail Services',
        when: 'Mon 17 · 3:30 PM',
        status: 'Enquiry',
        phone: '(415) 555-0173',
        email: 'sofia.r@example.com'
      }
    ]
  }
};

export const money = (value) => `$${value}`;
