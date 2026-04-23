// ─────────────────────────────────────────────────────────
//  EVENT CONFIGURATION — update all values here
// ─────────────────────────────────────────────────────────

export const EVENT = {
  organizerName:  'Jeff Entertainment',   // website brand — navbar, footer, ticket
  eventPresenter: 'Akure Outsiders',       // hero "presents" line
  eventName:      'IKOGOSI WARM SPRINGS',
  tagline:        'Fire & Ice Escape',
  subTagline:     'One Trip. Many Memories.',
  description:
    'Get ready for the most thrilling outdoor escape of the year! ' +
    'Akure Outsiders presents a full-day and overnight adventure to the legendary ' +
    'Ikogosi Warm Springs in Ekiti State — where hot and cold springs meet ' +
    'in the most magical natural phenomenon. Nature + Lifestyle + Nightlife, all in one trip.',

  date:        'TBA',
  displayDate: 'Date To Be Announced',
  time:        'TBA',
  doorsOpen:   'TBA',
  venue:       'Ikogosi Warm Springs',
  address:     'Ikogosi-Ekiti, Ekiti State, Nigeria',
  city:        'Ekiti State, Nigeria',
  takeOff:     'Akure',
  dressCode:   'Casual / Comfortable Outdoor Wear',

  currency:     '₦',
  currencyCode: 'NGN',

  dayVibes: [
    { icon: '♨️', text: 'Explore the famous warm springs' },
    { icon: '❄️', text: 'Cool off in the cold springs' },
    { icon: '🌿', text: 'Nature walk through the forest' },
    { icon: '🎮', text: 'Outdoor games & activities' },
    { icon: '📸', text: 'Content creation & photography' },
    { icon: '🤝', text: 'Connect & build new friendships' },
  ],

  nightVibes: [
    { icon: '🔥', text: 'Campfire & deep bonding session' },
    { icon: '🍖', text: 'BBQ & grills all night' },
    { icon: '🍹', text: 'Drinks & fun games' },
    { icon: '🎵', text: 'Music, dance & full Outsiders energy' },
    { icon: '🌙', text: 'Overnight stay under the stars' },
  ],

  highlights: [
    { icon: '🚌', label: 'Transport',        desc: 'Pick-up & drop-off from Akure' },
    { icon: '🏕️', label: 'Overnight Stay',  desc: 'Full overnight included' },
    { icon: '♨️', label: 'Warm Springs',    desc: 'Access to the legendary warm spring' },
    { icon: '❄️', label: 'Cold Springs',    desc: 'Where fire meets ice — literally' },
    { icon: '🍖', label: 'BBQ & Grills',    desc: 'Full evening cookout' },
    { icon: '🎵', label: 'Live Vibes',      desc: 'Music, games & Outsiders energy' },
  ],

  ticket: {
    id:          'vip' as const,
    label:       'General Admission',
    price:       40000,
    description: 'Everything included — the full Fire & Ice experience from start to finish.',
    color:       '#FF7A00',
    benefits: [
      'Transport from Akure (pick-up & drop-off)',
      'Full day access to Ikogosi Warm Springs',
      'Explore the warm & cold springs',
      'Nature walk & outdoor games',
      'Campfire & bonding night',
      'BBQ & grills',
      'Drinks & games',
      'Overnight stay included',
      'Music, dance & full Outsiders energy',
      'Downloadable QR ticket — entry at gate',
    ],
  },

  social: {
    instagram: 'https://www.instagram.com/jeff_entertainment?igsh=ejlraG1iY2JkYWZp',
    twitter:   'https://twitter.com/akureoutsiders',
    facebook:  'https://facebook.com/akureoutsiders',
    whatsapp:  'https://wa.me/2349035781670',
  },

  contact: {
    email: 'info@akureoutsiders.com',
    phone: '+2349035781670',
  },
} as const

export type TicketType = 'regular' | 'vip' | 'vvip' // kept for DB/scanner backward compat
