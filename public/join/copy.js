// /join waitlist page: ALL the page copy and settings live in this one file, so it can be sent to MFC and legal for
// review and edited in one place. Text only: no yields, returns, rent percentages, specific properties or prices.
// Phase 2: add an `it` block with the same keys and the page switches with ?lang=it.

export const CONFIG = {
  // Cloudflare Turnstile site key (public). Empty: the widget is not shown (set TURNSTILE_SECRET only together with it).
  turnstileSiteKey: '',
  video: {
    // self-hosted MP4 files under /assets/video/ (the site's CSP allows only its own files). null = not ready yet.
    teaser: null, // short muted loop shown in the hero
    full: null, // founder video, shown after signup and on the confirmation page
    poster: '/assets/img/join-token.webp'
  },
  links: {
    website: 'https://www.myntas.com/en/',
    linkedin: null, // company LinkedIn page URL, e.g. 'https://www.linkedin.com/company/...'
    privacy: '/en/privacy/'
  },
  // the signup reward: a founding collector card picked from a hash of the email, in three classes:
  //   landmark (common): real public-domain monuments; no Italian or Greek ones (commercial use of their images needs
  //     permission) and none whose image is trademarked or copyrighted (Empire State Building, Sydney Opera House...)
  //   legend (rare): mythical places; frontier (legendary): space. `odds` is the % chance of each class.
  // lat/lng (or url) open Google Maps in a new tab: a plain link, nothing from Google loads on the page.
  cardClasses: { frontier: 10, legend: 25, landmark: 65 },
  landmarks: [
    { id: 'liberty', cls: 'landmark', name: 'Statue of Liberty', city: 'New York', lat: 40.68925, lng: -74.0445 },
    { id: 'eiffel', cls: 'landmark', name: 'Eiffel Tower', city: 'Paris', lat: 48.85837, lng: 2.294481 },
    { id: 'bigben', cls: 'landmark', name: 'Big Ben', city: 'London', lat: 51.500729, lng: -0.124625 },
    { id: 'towerbridge', cls: 'landmark', name: 'Tower Bridge', city: 'London', lat: 51.505456, lng: -0.075356 },
    { id: 'arc', cls: 'landmark', name: 'Arc de Triomphe', city: 'Paris', lat: 48.873792, lng: 2.295028 },
    { id: 'brandenburg', cls: 'landmark', name: 'Brandenburg Gate', city: 'Berlin', lat: 52.516275, lng: 13.377704 },
    { id: 'tajmahal', cls: 'landmark', name: 'Taj Mahal', city: 'Agra', lat: 27.175015, lng: 78.042155 },
    { id: 'giza', cls: 'landmark', name: 'Pyramids of Giza', city: 'Giza', lat: 29.979235, lng: 31.134202 },
    { id: 'stonehenge', cls: 'landmark', name: 'Stonehenge', city: 'Wiltshire', lat: 51.178882, lng: -1.826215 },
    { id: 'greatwall', cls: 'landmark', name: 'Great Wall', city: 'Mutianyu, China', lat: 40.431908, lng: 116.570374 },
    { id: 'fuji', cls: 'landmark', name: 'Mount Fuji', city: 'Japan', lat: 35.360638, lng: 138.727363 },
    { id: 'moai', cls: 'landmark', name: 'Moai', city: 'Easter Island', lat: -27.125833, lng: -109.276944 },
    { id: 'windmill', cls: 'landmark', name: 'Kinderdijk Windmills', city: 'Netherlands', lat: 51.884722, lng: 4.639722 },
    { id: 'angkor', cls: 'landmark', name: 'Angkor Wat', city: 'Cambodia', lat: 13.412469, lng: 103.866986 },
    { id: 'atlantis', cls: 'legend', name: 'Atlantis', city: 'Beyond the Pillars of Hercules', lat: 36.0, lng: -9.5 },
    { id: 'eldorado', cls: 'legend', name: 'El Dorado', city: 'Lake Guatavita, Colombia', lat: 4.978333, lng: -73.776389 },
    { id: 'camelot', cls: 'legend', name: 'Camelot', city: 'Somerset, England', lat: 51.024167, lng: -2.531389 },
    { id: 'olympus', cls: 'legend', name: 'Home of the Gods', city: 'Mount Olympus', lat: 40.085556, lng: 22.358611 },
    { id: 'mars', cls: 'frontier', name: 'First House on Mars', city: 'Jezero Crater, Mars', url: 'https://www.google.com/maps/space/mars/' },
    { id: 'moon', cls: 'frontier', name: 'Moon Base One', city: 'Sea of Tranquility, Moon', url: 'https://www.google.com/maps/space/moon/' }
  ],
  // shown first in the country list (ISO codes); the full list follows
  topCountries: ['US', 'IT', 'GB', 'DE', 'CH', 'FR', 'ES', 'NL']
};

export const COPY = {
  en: {
    title: 'Join the waitlist · Myntas',
    description: 'Join the Myntas waitlist and meet the founders.',
    eyebrow: 'Myntas waitlist',
    headline: 'Real estate, <em>in digital shares.</em>',
    lead: 'We are building a marketplace for income-producing property, one share at a time. Join the waitlist to hear from us first.',
    videoTeaserLabel: 'A short look at Myntas',

    formTitle: 'Join the waitlist',
    formIntro: 'Takes about 20 seconds.',
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    country: 'Country of residence',
    countryPlaceholder: 'Select',
    role: 'What brings you here?',
    roles: {
      token_investor: 'I\'d like to invest in tokens',
      property_owner: 'I\'d like to tokenize my property',
      company_investor: 'I\'d like to invest in Myntas, the company',
      partner: 'Partner or advisor',
      follower: 'Just following'
    },
    researchNote: 'Non-binding. This is market research, not an offer or a commitment to invest.',
    likelihood: 'When the first property opens, how likely are you to invest?',
    likelihoods: { very_likely: 'Very likely', maybe: 'Maybe', just_curious: 'Just curious' },
    ticket: 'Indicative ticket (non-binding)',
    tickets: { under_1k: 'Under €1k', '1k_5k': '€1k to 5k', '5k_25k': '€5k to 25k', '25k_plus': '€25k+' },
    priority: 'What matters most to you?',
    priorities: { income: 'Monthly rental income', growth: 'Capital growth', diversification: 'Diversification' },
    optional: 'optional',
    linkedin: 'LinkedIn profile',
    linkedinPlaceholder: 'linkedin.com/in/…',
    consentUpdates: 'I agree to receive updates from Myntas S.r.l. about Myntas and future opportunities.',
    consentNewsletter: 'Subscribe me to the Myntas newsletter.',
    privacyNote: 'How we use your data: <a href="{privacy}">privacy notice</a>. You can unsubscribe at any time.',
    submit: 'Join the waitlist',
    sending: 'Sending…',

    errRequired: 'Please fill in the required fields.',
    errEmail: 'Please enter a valid email address.',
    errConsent: 'Please tick the first box to join.',
    errCaptcha: 'Please complete the check above the button.',
    errServer: 'Something went wrong. Please try again, or write to us at info@myntas.com.',

    thanksTitle: 'You\'re on the list.',
    thanksText: 'Check your inbox and confirm your email to complete your signup. The video is below.',
    thanksVideoTitle: 'Meet the founders',
    cardTitle: 'Your founding collectible',
    cardText: 'Thanks for joining early. Here is your collector card: a numbered piece of a famous place, real or legendary. Some are rarer than others.',
    cardKicker: 'Founding collector',
    cardPiece: 'Piece',
    cardHolder: 'Collector',
    cardEdition: 'Edition',
    cardOnline: 'Online',
    cardMap: 'See it on Google Maps',
    cardClass: { landmark: ['Landmark', 'Common'], legend: ['Legend', 'Rare'], frontier: ['Frontier', 'Legendary'] },
    cardSave: 'Save card',
    cardShare: 'Share',
    cardDisclaimer: 'A collectible for fun. It is not a share of any property, has no value, is not an investment and is not on a blockchain. Not affiliated with any landmark or its owners.',
    videoSoon: 'The founder video will be here soon. We will also send it to you by email.',
    followLinkedin: 'Follow us on LinkedIn',
    visitWebsite: 'Visit myntas.com',

    confirmedTitle: 'Email confirmed.',
    confirmedText: 'Thank you. You are on the Myntas waitlist and will hear from us first.',

    disclaimer: 'No offer of securities is being made. Any future offering will be made only through the relevant offering documents and only where permitted by law.',
    company: 'Myntas S.r.l. · Viale Spartaco Lavagnini 13, 50129 Firenze',
    contact: 'info@myntas.com',
    privacyLink: 'Privacy notice',
    noscript: 'Please enable JavaScript to join, or write to us at info@myntas.com.'
  }
};
