export interface AppDef {
  name: string;
  slug: string;
  oneLiner: string;
  features: string[];
  icon: string;
  theme: 'orange' | 'blue' | 'green' | 'purple';
  ctaType: 'demo' | 'visit' | 'download' | 'coming-soon';
  links: {
    web?: string;
    appStore?: string;
    playStore?: string;
    chromeStore?: string;
  };
  description: string;
  featured?: boolean;
  beta?: boolean;
}


export const APPS: AppDef[] = [
  {
    name: 'TaxFlow',
    slug: 'taxflowai',
    oneLiner: 'ATO tax research, done.',
    features: ['Cited ATO answers', 'ATO letter response drafting', 'Firm knowledge base', 'Document generation'],
    icon: 'Calculator',
    theme: 'orange',
    ctaType: 'visit',
    links: {
      web: 'https://taxflow.crewcircle.com.au',
    },
    description:
      'AI research assistant for Australian tax professionals. Ask ATO questions in plain English, get cited answers from public rulings and legislation. Upload an ATO letter for a drafted response, generate firm-branded documents, build a private knowledge base.',
    featured: true,
  },
  {
    name: 'LocalMate',
    slug: 'localmate',
    oneLiner: 'Local business automation for Aussie SMBs.',
    features: ['AI review replies', 'Local SEO tracking', 'Competitor monitoring', 'Rebooking follow-ups'],
    icon: 'Users',
    theme: 'blue',
    ctaType: 'visit',
    links: {
      web: 'https://localmate.crewcircle.com.au',
    },
    description:
      'One dashboard runs five AI jobs: Review Guard drafts replies to Google and Yelp reviews; Rank Report tracks local SEO weekly; Competitor Watch monitors nearby rivals; Rebook follows up lapsed customers by SMS and email; Menu Sync pushes updates from Google Sheets to Google Business Profile and Square.',
    featured: true,
  },
  {
    name: 'CrewRoster',
    slug: 'crewroster',
    oneLiner: 'Rostering and timesheets for your crew.',
    features: ['Shift scheduling', 'GPS clock-in/out', 'Payroll export', 'Award compliance'],
    icon: 'Timer',
    theme: 'orange',
    ctaType: 'visit',
    links: {
      web: 'https://roster.crewcircle.com.au',
    },
    description:
      'Digital rostering and timesheets for shift-based crews. Schedule shifts, record GPS clock-in and clock-out, export hours for payroll. Built for Aussie cafes, shops, and tradies. Free for up to 5 employees; paid plans scale per employee.',
    featured: false,
  },
  {
    name: 'SmartGL',
    slug: 'smartgl',
    oneLiner: 'AI bookkeeping with Australian GST.',
    features: ['Bank feed sync', 'AI categorisation', 'Double-entry ledger', 'GST/BAS ready'],
    icon: 'BookOpen',
    theme: 'blue',
    ctaType: 'coming-soon',
    links: {},
    description:
      'Connects to Australian bank feeds, auto-categorises transactions, maintains a double-entry ledger with GST/BAS reporting.',
    featured: false,
    beta: true,
  },
  {
    name: 'CardSnap',
    slug: 'cardsnap',
    oneLiner: 'Snap cards, save contacts. Mobile app.',
    features: ['On-device OCR', 'Contact save', 'CSV export', 'Search history'],
    icon: 'Camera',
    theme: 'green',
    ctaType: 'coming-soon',
    links: {},
    description:
      'Free business-card scanner with on-device OCR. Snap a card, contacts land in your address book. Export CSV, search history.',
    featured: false,
    beta: true,
  },
  {
    name: 'AuRate',
    slug: 'aurate',
    oneLiner: 'ATO admin in one click. Chrome extension.',
    features: ['ABN lookup', 'ATO rates', 'BAS reminders', 'Chrome extension'],
    icon: 'Wrench',
    theme: 'purple',
    ctaType: 'coming-soon',
    links: {},
    description:
      'Free Chrome sidekick for sole traders. Validate ABN, check ATO rates, get BAS reminders without leaving your browser.',
    featured: false,
    beta: true,
  },
];
