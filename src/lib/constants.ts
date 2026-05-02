

export interface AppDef {
  name: string;
  slug: string;
  oneLiner: string;
  features: string[];
  icon: string;
  theme: 'orange' | 'blue' | 'green' | 'purple';
  ctaType: 'demo' | 'visit' | 'download';
  links: {
    web?: string;
    appStore?: string;
    playStore?: string;
    chromeStore?: string;
  };
  description: string;
}

export const APPS: AppDef[] = [
  {
    name: 'Crew Roster',
    slug: 'crew-roster',
    oneLiner: 'Digital timesheet for your crew - sorted.',
    features: ['Roster scheduling', 'GPS clock-in/out', 'Award compliance'],
    icon: '⏱',
    theme: 'orange',
    ctaType: 'visit',
    links: {
      web: 'https://roster.crewcircle.co',
    },
      description: 'Digital timesheet. That\'s it.',
  },
  {
    name: 'Smart GL',
    slug: 'smart-gl',
    oneLiner: 'AI does the books for your crew.',
    features: ['AI categorisation', 'GST/BAS reports', 'Ledger tracking'],
    icon: '📒',
    theme: 'blue',
    ctaType: 'visit',
    links: {
      web: 'https://smartgl.crewcircle.co',
    },
    description: 'AI does the books for your crew. That\'s it.',
  },
  {
    name: 'Card Snap',
    slug: 'card-snap',
    oneLiner: 'Snap cards for your crew.',
    features: ['ML Kit OCR', 'Contact save', 'Card history'],
    icon: '📷',
    theme: 'green',
    ctaType: 'download',
    links: {
      web: '/card-snap',
      appStore: '#ios',
      playStore: '#android',
    },
    description: 'Snap cards for your crew. That\'s it.',
  },
  {
    name: 'XeroAssist',
    slug: 'xero-assist',
    oneLiner: 'Xero spanner for your crew.',
    features: ['ABN validation', 'BAS tracker', 'ATO rates'],
    icon: '🔧',
    theme: 'purple',
    ctaType: 'download',
    links: {
      chromeStore: '#chrome',
    },
      description: 'Xero spanner for your crew. That\'s it.',
  },
];


export const NAV_ITEMS = [
  { label: 'Our Apps', href: '/#apps', hasDropdown: true },
  { label: 'Blog', href: '/blog', hasDropdown: false },
];

export const FOOTER_LINKS = {
  brand: [
    { label: 'Our Story', href: '/our-story' },
    { label: 'Blog', href: '/blog' },
    { label: 'GitHub', href: 'https://github.com/crewcircle' },
  ],
  apps: [
    { label: 'Crew Roster', href: 'https://roster.crewcircle.co' },
    { label: 'Smart GL', href: 'https://smartgl.crewcircle.co' },
    { label: 'Card Snap', href: '/card-snap' },
    { label: 'XeroAssist', href: 'https://xero-assist.crewcircle.co' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Documentation', href: '/docs' },
  ],
};


export const AUSSIE_TERMS = {
  tagline: "Sorted.",
  subtitle: "Tools for tradies.",
  cta: "Ready?",
  exploreBtn: "Tools",
  viewAllBtn: "All Tools",
  getStartedBtn: "Get it",
};
