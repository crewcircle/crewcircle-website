import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LOCATIONS } from '@/lib/config/locations';
import { Building2, UtensilsCrossed, Stethoscope, Hammer } from 'lucide-react';

const SEGMENT_ICONS = {
  tradies: Hammer,
  cafes: UtensilsCrossed,
  clinics: Stethoscope,
  retail: Building2,
} as const;

export const metadata: Metadata = {
  title: 'CrewCircle across Australia',
  description:
    'Purpose-built AI tools for small business in Sydney, Melbourne, Brisbane, Perth and Adelaide. Sort tax, rostering and bookkeeping from your city.',
};

export default function LocationsPage() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Locations
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">
          CrewCircle across Australia
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Small business runs differently in every city. CrewCircle brings
          practical AI to tradies, cafés, clinics and shops right where you are.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {LOCATIONS.map((location) => (
            <div
              key={location.slug}
              className="rounded-2xl border border-border bg-background p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold text-foreground">
                  {location.city}
                </h3>
                <span className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-full bg-muted">
                  {location.state}
                </span>
              </div>
              <p className="text-accent font-medium mt-2 text-sm">
                {location.tagline}
              </p>
              <p className="text-sm text-muted-foreground mt-3 flex-1">
                {location.intro}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4 mb-5">
                {location.prioritySegments.map((segment) => {
                  const Icon = SEGMENT_ICONS[segment as keyof typeof SEGMENT_ICONS];
                  return (
                    <span
                      key={segment}
                      className="flex items-center gap-1 text-xs text-muted-foreground px-2 py-1 rounded bg-muted"
                    >
                      <Icon className="w-3 h-3" />
                      {segment.charAt(0).toUpperCase() + segment.slice(1)}
                    </span>
                  );
                })}
              </div>
              <div className="mt-5">
                <Button
                  variant="default"
                  size="sm"
                  render={<Link href={`/locations/${location.slug}`} />}
                >
                  Explore {location.city}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
