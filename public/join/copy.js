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
    role: 'I\'m interested as',
    roles: {
      token_investor: 'Investing in properties (future token holder)',
      company_investor: 'Investing in Myntas, the company',
      partner: 'Property owner or partner',
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
