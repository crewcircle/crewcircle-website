export interface Segment {
  slug: string;
  name: string;
  /** lucide-react icon name — imported explicitly in the Solutions page */
  icon: 'Wrench' | 'Coffee' | 'Stethoscope' | 'ShoppingBag';
  tagline: string;
  pain: string;
  outcome: string;
  /** slugs from src/lib/config/apps.ts */
  appSlugs: string[];
}

export const SEGMENTS: Segment[] = [
  {
    slug: 'tradies',
    name: 'Tradies',
    icon: 'Wrench',
    tagline: 'Less paperwork, more on the tools.',
    pain: 'You’re flat out on site. Receipts pile up, BAS creeps up, and rostering the crew is a whiteboard nightmare.',
    outcome:
      'Get GST and BAS questions answered with cited ATO sources, roster the crew from the job site, and validate ABNs in one click.',
    appSlugs: ['taxflowai', 'crewroster', 'aurate'],
  },
  {
    slug: 'cafes',
    name: 'Cafés & Restaurants',
    icon: 'Coffee',
    tagline: 'Run the floor, not the spreadsheets.',
    pain: 'Rosters, wages, and supplier bills eat your mornings. BAS is a mystery you pay someone else to worry about.',
    outcome:
      'Automate the roster with award rates built in, reply to reviews and track local SEO with LocalMate, and keep day-to-day ATO admin free with AuRate.',
    appSlugs: ['crewroster', 'localmate', 'aurate'],
  },
  {
    slug: 'clinics',
    name: 'Allied Health',
    icon: 'Stethoscope',
    tagline: 'Patient care first, admin last.',
    pain: 'Solo or small practice, you’re the receptionist, bookkeeper and clinician. Compliance and BAS compete with care.',
    outcome:
      'Get GST and BAS questions answered with cited ATO sources, validate ABNs instantly, and keep the books sorted with SmartGL.',
    appSlugs: ['taxflowai', 'aurate', 'smartgl'],
  },
  {
    slug: 'retail',
    name: 'Retail & Shops',
    icon: 'ShoppingBag',
    tagline: 'Sell more, admin less.',
    pain: 'Stock, staff, and supplier invoices. The back office grows faster than the floor.',
    outcome:
      'Roster staff to demand, categorise expenses automatically with SmartGL, and never miss a BAS deadline with AuRate.',
    appSlugs: ['crewroster', 'smartgl', 'aurate'],
  },
];
