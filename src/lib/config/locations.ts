export type LocationSlug = 'sydney' | 'melbourne' | 'brisbane' | 'perth' | 'adelaide';

export interface LocationProfile {
  slug: LocationSlug;
  city: string;
  state: string;
  tagline: string;
  intro: string;
  prioritySegments: string[];
}

export const LOCATIONS: LocationProfile[] = [
  {
    slug: 'sydney',
    city: 'Sydney',
    state: 'NSW',
    tagline: 'Built for tradies, cafés, and clinics across the Harbour City',
    intro:
      'From Bondi cafés to Western Sydney tradies, Sydney businesses use CrewCircle to sort rostering, tax compliance, and bookkeeping without the enterprise price tag.',
    prioritySegments: ['tradies', 'cafes', 'clinics', 'retail'],
  },
  {
    slug: 'melbourne',
    city: 'Melbourne',
    state: 'VIC',
    tagline: 'Melbourne small business runs on CrewCircle',
    intro:
      "Melbourne's laneway cafés, inner-city tradies, and independent retailers run on tight margins. CrewCircle automates the back-office so you stay on the tools instead of the spreadsheet.",
    prioritySegments: ['cafes', 'tradies', 'retail', 'clinics'],
  },
  {
    slug: 'brisbane',
    city: 'Brisbane',
    state: 'QLD',
    tagline: 'Queensland tradies and clinics sort admin in minutes',
    intro:
      'Brisbane tradies and allied-health practices are sorting rosters, invoices and BAS in minutes with CrewCircle — built for the way Queensland businesses actually work.',
    prioritySegments: ['tradies', 'clinics', 'cafes', 'retail'],
  },
  {
    slug: 'perth',
    city: 'Perth',
    state: 'WA',
    tagline: 'WA operators keep paperwork sorted with CrewCircle',
    intro:
      'From mines-adjacent tradies to suburban cafés and clinics — Perth operators use CrewCircle to keep the paperwork sorted and stay focused on the work that pays.',
    prioritySegments: ['tradies', 'retail', 'cafes', 'clinics'],
  },
  {
    slug: 'adelaide',
    city: 'Adelaide',
    state: 'SA',
    tagline: 'Adelaide small business automates the boring stuff',
    intro:
      "Adelaide's tight-knit small-business community is picking up CrewCircle to automate rostering, bookkeeping and compliance — practical software that just works.",
    prioritySegments: ['retail', 'cafes', 'tradies', 'clinics'],
  },
];

export function getLocation(slug: string): LocationProfile | undefined {
  return LOCATIONS.find((l) => l.slug === slug);
}
