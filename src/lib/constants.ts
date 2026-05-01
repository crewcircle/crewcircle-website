

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
    oneLiner: 'Rostering that gets sorted - no more WhatsApp chains.',
    features: ['Roster scheduling', 'GPS clock-in/out', 'Award compliance'],
    icon: '📅',
    theme: 'orange',
    ctaType: 'demo',
    links: {
      web: 'https://roster.crewcircle.co',
    },
    description:
       'Sort your crew in minutes - drag-drop rostering, GPS clock-in, and award compliance all in one. Built for cafés, tradies, and shops that hate paperwork.',
  },
  {
    name: 'Smart GL',
    slug: 'smart-gl',
    oneLiner: 'Your books sorted - GST, BAS, and AI insights.',
    features: ['AI categorisation', 'GST/BAS reports', 'Ledger tracking'],
    icon: '📒',
    theme: 'blue',
    ctaType: 'visit',
    links: {
      web: 'https://smartgl.crewcircle.co',
    },
    description:
             'Stuff your receipts in, and boom - AI does the books. GST, BAS, and profit insights served fresh. No more shoebox accounting.',
  },
  {
    name: 'Card Snap',
    slug: 'card-snap',
    oneLiner: 'Snap business cards — saved to contacts.',
    features: ['ML Kit OCR', 'Contact save', 'Card history'],
    icon: '📸',
    theme: 'green',
    ctaType: 'download',
    links: {
      appStore: '#ios',
      playStore: '#android',
    },
    description:
              'Point, shoot, done. Snap a biz card, and it\'s straight into your contacts - no typing, no fuss. Perfect for tradies on the go.',
  },
  {
    name: 'XeroAssist',
    slug: 'xero-assist',
    oneLiner: 'Xero helpers for AU/NZ bookkeepers - sorted.',
    features: ['ABN validation', 'BAS tracker', 'ATO rates'],
    icon: '🤖',
    theme: 'purple',
    ctaType: 'download',
    links: {
      chromeStore: '#chrome',
    },
    description:
      'Your Xero sidekick — validates ABNs, tracks BAS dues, and lets you flip between tenants. Built for bookkeepers who want Xero without the headache.',
  },
];


export const DEMO_CONFIG = {
  heading: 'Try Crew Roster Demo',
  subheading: 'Explore all features with a pre-configured demo organization for',
  orgName: 'The Daily Grind Cafe',
  orgLocation: 'Surry Hills, Sydney',
  users: [
    { role: 'Owner', name: 'Maria Papadopoulos', color: 'orange' },
    { role: 'Manager', name: 'Jake Thompson', color: 'blue' },
    { role: 'Employee', name: 'Sarah Chen', color: 'green' },
    { role: 'Employee', name: 'Emma Wilson', color: 'purple' },
  ],
  note: 'Part of the CrewCircle suite of apps for Australian small businesses.',
};


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
    { label: 'Crew Roster', href: '/roster' },
    { label: 'Smart GL', href: '/smartgl' },
    { label: 'Card Snap', href: '/card-snap' },
    { label: 'XeroAssist', href: '/xero-assist' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Documentation', href: '/docs' },
  ],
};


export const AUSSIE_TERMS = {
   tagline: "Software that sorts your small biz - no dramas.",
   subtitle: "We build tools for Aussie cafes, tradies, shops & healthcare teams.",
  cta: "Ready to sort your business?",
  exploreBtn: "Explore Our Apps",
  viewAllBtn: "See All Apps",
  getStartedBtn: "Get Started",
};
