'use client';

import { useState } from 'react';
import { APPS } from '@/lib/config/apps';
import { PRICING_SECTIONS, FREE_TOOLS_BLURB } from '@/lib/config/pricing';
import AppCard from '@/components/ui/AppCard';
import AppDemoTabs from '@/components/sections/AppDemoTabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Timer, BookOpen, Camera, Wrench, Users, Calculator } from 'lucide-react';

const appIcons: Record<string, React.ReactNode> = {
  Timer: <Timer className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Camera: <Camera className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Calculator: <Calculator className="w-6 h-6" />,
};

const SOLUTIONS = [
  {
    id: 'tradies',
    label: 'Tradies',
    description: 'Rostering, invoicing, BAS, award compliance - all sorted.',
    apps: ['crewroster', 'taxflowai'],
  },
  {
    id: 'cafes',
    label: 'Cafes & Hospitality',
    description: 'Review replies, local SEO, rebooking, menu sync - hands off.',
    apps: ['localmate'],
  },
  {
    id: 'clinics',
    label: 'Allied Health Clinics',
    description: 'Shift scheduling, patient comms, compliance, bookkeeping.',
    apps: ['crewroster', 'taxflowai', 'localmate'],
  },
  {
    id: 'retail',
    label: 'Retail & Services',
    description: 'Stock alerts, staff rostering, local visibility, tax help.',
    apps: ['localmate', 'crewroster'],
  },
];

const PRICING_TABS = [
  {
    id: 'localmate',
    label: 'LocalMate',
    apps: ['localmate'],
  },
  {
    id: 'taxflowai',
    label: 'TaxFlow',
    apps: ['taxflowai'],
  },
  {
    id: 'crewroster',
    label: 'CrewRoster',
    apps: ['crewroster'],
  },
];

export default function AppsGrid() {
  const betaApps = APPS.filter((app) => app.beta);
  const [pricingTab, setPricingTab] = useState(PRICING_TABS[0].id);

  return (
    <section id="apps" className="py-24 md:py-32 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto mb-14 text-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            Built in-house
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Apps
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Three apps are live today — TaxFlow, LocalMate, and CrewRoster.
          </p>
        </div>

        <AppDemoTabs />

        <div className="mt-16 mb-10">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Coming soon (Aug 2026)
          </h3>
          <p className="text-muted-foreground text-sm">
            SmartGL, CardSnap, AuRate — bookkeeping, cards, ATO admin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {betaApps.map((app) => (
            <AppCard key={app.slug} app={app} compact />
          ))}
        </div>

        {/* Solutions tabs merged with Our Apps */}
        <div className="mt-20">
          <div className="max-w-2xl mx-auto mb-10 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Which one are you?
            </h3>
          </div>

          <SolutionsTabs />
        </div>

        {/* Pricing Tabs */}
        <div className="mt-20">
          <div className="max-w-2xl mx-auto mb-10 text-center">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Pricing
            </h3>
            <p className="text-muted-foreground text-sm">
              Simple, transparent pricing for each app. No hidden fees.
            </p>
          </div>

          <PricingTabs />
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm">
            {FREE_TOOLS_BLURB}
          </p>
        </div>
      </div>
    </section>
  );
}

function SolutionsTabs() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {SOLUTIONS.map((sol) => (
          <div
            key={sol.id}
            className="bg-muted/50 border border-border rounded-xl p-6 hover:border-accent/20 hover:shadow-md transition-all duration-200 flex flex-col"
          >
            <h4 className="text-lg font-bold text-foreground mb-2">{sol.label}</h4>
            <p className="text-accent font-medium mb-6 text-sm">{sol.description}</p>
            <div className="flex flex-wrap gap-3 flex-1">
              {sol.apps.map((appSlug) => {
                const app = APPS.find((a) => a.slug === appSlug);
                if (!app) return null;
                return (
                  <Link
                    key={app.slug}
                    href={app.links.web || '#'}
                    className="flex flex-col gap-2 min-w-[140px] flex-1 p-3 bg-background rounded-lg border border-border hover:border-accent/20 transition-all duration-200"
                    target={app.links.web ? '_blank' : undefined}
                    rel={app.links.web ? 'noopener noreferrer' : undefined}
                  >
                    <div className="bg-accent/10 text-accent rounded-lg flex items-center justify-center w-10 h-10 shrink-0">
                      {appIcons[app.icon] || <Wrench className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-foreground truncate text-sm">{app.name}</h5>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed">
                        {sol.apps.length > 1 
                          ? (sol.id === 'tradies' && app.slug === 'taxflowai') ? 'ATO tax research & compliance'
                            : (sol.id === 'tradies' && app.slug === 'crewroster') ? 'Shift scheduling & GPS timesheets'
                            : (sol.id === 'clinics' && app.slug === 'taxflowai') ? 'ATO compliance & BAS help'
                            : (sol.id === 'clinics' && app.slug === 'crewroster') ? 'Shift scheduling & compliance'
                            : (sol.id === 'clinics' && app.slug === 'localmate') ? 'Review replies & local SEO'
                            : (sol.id === 'retail' && app.slug === 'crewroster') ? 'Staff rostering & costs'
                            : (sol.id === 'retail' && app.slug === 'localmate') ? 'Review replies & local visibility'
                            : app.oneLiner
                          : app.oneLiner}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingTabs() {
  const [activeTab, setActiveTab] = useState(PRICING_TABS[0]?.id || 'localmate');

  const currentSection = PRICING_SECTIONS.find((s) => s.appSlug === activeTab);
  const tiers = currentSection?.tiers || [];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden p-6 md:p-8">
      <div className="flex flex-wrap gap-2 mb-8 border-b border-border pb-4">
        {PRICING_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`bg-card border border-border rounded-xl p-6 hover:shadow-md hover:border-accent/20 transition-all duration-200 flex flex-col ${tier.highlight ? 'border-accent/30 shadow-accent/10' : ''}`}
          >
            <div className="mb-4">
              <h5 className="text-lg font-bold text-foreground mb-1">{tier.name}</h5>
              <p className="text-muted-foreground text-sm">{tier.blurb}</p>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">{tier.price}</span>
              <span className="text-muted-foreground">/{tier.period}</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={tier.highlight ? 'default' : 'outline'}
              className="w-full hover:bg-accent hover:text-accent-foreground"
              render={<Link href={tier.cta.href} />}
            >
              {tier.cta.label}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            {tier.highlight && tier.note && (
              <p className="text-[11px] text-muted-foreground mt-3 text-center">{tier.note}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}