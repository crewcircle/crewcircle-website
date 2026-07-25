import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Coffee, Stethoscope, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LOCATIONS, getLocation } from '@/lib/config/locations';
import { SEGMENTS } from '@/lib/config/segments';
import { APPS } from '@/lib/config/apps';

const ICONS = { Wrench, Coffee, Stethoscope, ShoppingBag } as const;

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loc = getLocation(slug);
  if (!loc) return {};
  return {
    title: `CrewCircle in ${loc.city} | AI for ${loc.state} small business`,
    description: loc.intro,
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loc = getLocation(slug);
  if (!loc) notFound();

  return (
    <>
      <section className="py-24 md:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-wide text-accent">
            {loc.state}
          </span>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">
            CrewCircle in {loc.city}
          </h1>
          <p className="mt-4 text-accent font-medium text-lg">{loc.tagline}</p>
          <p className="mt-3 text-muted-foreground max-w-2xl">{loc.intro}</p>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Who we help in {loc.city}
          </h2>

          {SEGMENTS.map((segment) => {
            const Icon = ICONS[segment.icon as keyof typeof ICONS];
            const recommendedApps = segment.appSlugs
              .map((appSlug) => APPS.find((a) => a.slug === appSlug))
              .filter(
                (app): app is (typeof APPS)[number] => app !== undefined,
              );

            return (
              <section
                key={segment.slug}
                className="py-12 border-t border-border first:border-t-0"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mt-4">
                      {segment.name}
                    </h3>
                    <p className="text-accent font-medium mt-1">
                      {segment.tagline}
                    </p>
                    <p className="text-muted-foreground mt-4">{segment.pain}</p>
                    <p className="text-muted-foreground mt-3">
                      {segment.outcome}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button variant="accent" render={<Link href="/pricing" />}>
                        See pricing
                      </Button>
                      <Button
                        variant="outline"
                        render={<Link href="/#contact" />}
                      >
                        Talk to us
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                      Recommended tools
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {recommendedApps.map((app) => {
                        const href =
                          !app.links.web || app.links.web === '#'
                            ? '/#apps'
                            : app.links.web;
                        const isExternal = href.startsWith('http');

                        const linkProps = isExternal
                          ? {
                              target: '_blank',
                              rel: 'noopener noreferrer' as const,
                            }
                          : {};

                        return (
                          <Link
                            key={app.slug}
                            href={href}
                            {...linkProps}
                            className="rounded-xl border border-border bg-background p-5 block hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="font-semibold text-foreground">
                                {app.name}
                              </h5>
                              <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {app.oneLiner}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            );
          })}

          <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              Ready to try CrewCircle in {loc.city}?
            </h2>
            <p className="text-muted-foreground mt-2">
              See how it fits your business — or tell us what you need and
              we&apos;ll point you to the right tool.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="accent" render={<Link href="/pricing" />}>
                See pricing
              </Button>
              <Button variant="default" render={<Link href="/#contact" />}>
                Talk to us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
