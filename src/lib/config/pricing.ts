export interface PricingTier {
  name: string;
  price: number;
  period: "month" | "year" | "forever";
  blurb: string;
  features: string[];
  highlight?: boolean;
  note?: string;
  cta: { label: string; href: string };
}

export interface PricingSection {
  appName: string;
  appSlug: string;
  description: string;
  note?: string;
  tiers: PricingTier[];
}

export const PRICING_SECTIONS: PricingSection[] = [
  {
    appName: "LocalMate",
    appSlug: "localmate",
    description:
      "Local business automation for Australian trades, cafés, clinics, and shops. Pick a plan that runs the jobs you actually need.",
    note: "14-day free trial. No credit card required. Cancel anytime. Prices are in AUD and include GST.",
    tiers: [
      {
        name: "Starter",
        price: 49,
        period: "month",
        blurb: "Track the keywords that bring customers to your suburb.",
        features: [
          "Rank Report — weekly local SEO email",
          "5 suburb keywords tracked",
          "Email support",
        ],
        cta: {
          label: "Start free trial",
          href: "https://localmate.crewcircle.com.au",
        },
      },
      {
        name: "Growth",
        price: 79,
        period: "month",
        blurb: "Reply to reviews and watch competitors while you work.",
        features: [
          "Review Guard — AI-drafted Google/Yelp replies",
          "Rank Report — weekly local SEO email",
          "Competitor Watch — Monday morning brief",
          "Email support",
        ],
        highlight: true,
        cta: {
          label: "Start free trial",
          href: "https://localmate.crewcircle.com.au",
        },
      },
      {
        name: "Complete",
        price: 100,
        period: "month",
        blurb: "The full set-and-forget local marketing assistant.",
        features: [
          "Everything in Growth",
          "Rebook — lapsed patient SMS follow-up",
          "Menu Sync — Google Sheets to GBP + Square",
          "Priority support",
        ],
        cta: {
          label: "Start free trial",
          href: "https://localmate.crewcircle.com.au",
        },
      },
    ],
  },
  {
    appName: "TaxFlowAI",
    appSlug: "taxflowai",
    description:
      "ATO tax research and advisory AI built for Australian accounting firms. Billed monthly.",
    note: "Prices are in AUD and exclude GST. Both plans include the ATO correspondence module.",
    tiers: [
      {
        name: "Starter",
        price: 100,
        period: "month",
        blurb: "For smaller firms starting to automate tax research.",
        features: [
          "300 research queries / month",
          "50 documents / month",
          "ATO correspondence module",
          "Email support",
        ],
        cta: {
          label: "Request access",
          href: "https://taxflow.crewcircle.com.au",
        },
      },
      {
        name: "Professional",
        price: 250,
        period: "month",
        blurb: "For firms that want unlimited research plus a private knowledge base.",
        features: [
          "Unlimited research queries",
          "Unlimited documents",
          "ATO correspondence module",
          "Firm knowledge base",
          "Regulatory alerts",
          "Priority support",
        ],
        highlight: true,
        cta: {
          label: "Request access",
          href: "https://taxflow.crewcircle.com.au",
        },
      },
    ],
  },
  {
    appName: "CrewRoster",
    appSlug: "crewroster",
    description:
      "Rostering and timesheets for shift-based crews. Start free and only pay once you grow past 5 employees.",
    note: "Prices are in AUD and exclude GST. Subscriptions are billed monthly based on active employees.",
    tiers: [
      {
        name: "Free",
        price: 0,
        period: "month",
        blurb: "For the little guys starting out.",
        features: [
          "Up to 5 employees",
          "Full rostering features",
          "Mobile app for your team",
          "GPS clock in/out",
        ],
        cta: {
          label: "Start for free",
          href: "https://roster.crewcircle.com.au",
        },
      },
      {
        name: "Starter",
        price: 4,
        period: "month",
        blurb: "For growing teams.",
        features: [
          "Unlimited employees",
          "Pay for what you use",
          "Priority support",
          "CSV export for payroll",
          "Labour cost tracking",
        ],
        highlight: true,
        cta: {
          label: "Start free trial",
          href: "https://roster.crewcircle.com.au",
        },
      },
    ],
  },
];

export const FREE_TOOLS_BLURB =
  "CardSnap and AuRate are free helpers. Both launch in August 2026 on the App Store, Google Play, and Chrome Web Store.";
