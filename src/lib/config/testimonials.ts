export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  business: string;
  segment: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'TaxFlowAI gives me straight answers on GST and BAS with the ATO references behind them. No more guessing come tax time.',
    name: 'Mick O’Brien',
    role: 'Owner',
    business: 'O’Brien’s Plumbing',
    segment: 'Tradies',
  },
  {
    quote:
      'CrewRoster took our weekly roster off a whiteboard and into the phone. Award rates are handled and payroll is a one-click export.',
    name: 'Priya Nair',
    role: 'Cafe Manager',
    business: 'The Daily Grind',
    segment: 'Cafés & Restaurants',
  },
  {
    quote:
      'As a solo physio I wear every hat. AuRate reminds me about BAS and validates ABNs in a click. It’s the free sidekick I didn’t know I needed.',
    name: 'Dr. Sarah Lim',
    role: 'Principal Physiotherapist',
    business: 'Lim Movement Clinic',
    segment: 'Allied Health',
  },
];
