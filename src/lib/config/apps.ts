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
    oneLiner: 'Digital timesheet for your crew, sorted.',
    features: ['Roster scheduling', 'GPS clock-in/out', 'Award compliance'],
    icon: 'Timer',
    theme: 'orange',
    ctaType: 'visit',
    links: {
      web: 'https://roster.crewcircle.com',
    },
    description: 'Replace paper timesheets with digital clock-ins. GPS-tracked shifts, award compliance rules baked in, and automated payroll export. Your crew signs in from the job site, you get the hours sorted automatically at the end of the week.',
  },
  {
    name: 'Smart GL',
    slug: 'smart-gl',
    oneLiner: 'AI does the books for your crew.',
    features: ['AI categorisation', 'GST/BAS reports', 'Ledger tracking'],
    icon: 'BookOpen',
    theme: 'blue',
    ctaType: 'visit',
    links: {
      web: '#', // placeholder — no production URL yet
    },
    description: 'AI-powered bookkeeping that categorises wages, supplier bills, and expenses automatically. Generates GST/BAS reports ready for your accountant. No cloud dependence, your data stays private.',
  },
  {
    name: 'Card Snap',
    slug: 'card-snap',
    oneLiner: 'Snap cards for your crew.',
    features: ['ML Kit OCR', 'Contact save', 'Card history'],
    icon: 'Camera',
    theme: 'green',
    ctaType: 'download',
    links: {
      web: '/cardsnap',
      appStore: '#ios',
      playStore: '#android',
    },
    description: 'Snap a photo of any business card and watch the details land straight in your contacts. Uses on-device ML Kit OCR so nothing leaves your phone. Export to CSV, search history, never lose a contact again.',
  },
  {
    name: 'XeroAssist',
    slug: 'xero-assist',
    oneLiner: 'Xero spanner for your crew.',
    features: ['ABN validation', 'BAS tracker', 'ATO rates'],
    icon: 'Wrench',
    theme: 'purple',
    ctaType: 'download',
    links: {
      chromeStore: '#chrome',
    },
    description: 'Chrome extension that gives Xero superpowers. Validate ABNs instantly, track BAS deadlines, pull ATO rates without leaving your browser. Built for bookkeepers who live in Xero every day.',
  },
];
