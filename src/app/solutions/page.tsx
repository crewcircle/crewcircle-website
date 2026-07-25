import type { Metadata } from 'next';
import Link from 'next/link';
import { Wrench, Coffee, Stethoscope, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SEGMENTS } from '@/lib/config/segments';
import { APPS } from '@/lib/config/apps';

export const metadata: Metadata = {
  title: 'Solutions for small business — CrewCircle',
  description:
    'Purpose-built AI tools for tradies, cafés, allied health and retail. Sort tax, rostering and bookkeeping without the enterprise nonsense.',
};

const ICONS = { Wrench, Coffee, Stethoscope, ShoppingBag } as const;

export default function SolutionsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <span className="text-xs font-semibold tracking-widest uppercase text-accent">
        Solutions
      </span>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
        Built for the way you actually work.
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Pick your trade. See exactly which CrewCircle tools sort the boring
        stuff for you.
      </p>

      {SEGMENTS.map((segment) => {
        const Icon = ICONS[segment.icon];
        const apps = APPS.filter((a) => segment.appSlugs.includes(a.slug));

        return (
          <section
            key={segment.slug}
            id={segment.slug}
            className="scroll-mt-24 py-12 border-t border-border first:border-t-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                  <Icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mt-4">
                  {segment.name}
                </h2>
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
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                  Recommended tools
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {apps.map((app) => {
                    const href =
                      !app.links.web || app.links.web === '#'
                        ? '/#apps'
                        : app.links.web;
                    const isExternal = href.startsWith('http');

                    const linkProps = isExternal
                      ? { target: '_blank', rel: 'noopener noreferrer' as const }
                      : {};

                    return (
                      <Link
                        key={app.slug}
                        href={href}
                        {...linkProps}
                        className="rounded-xl border border-border bg-background p-5 block hover:bg-muted transition-colors"
                      >
                        <h3 className="font-semibold text-foreground">
                          {app.name}
                        </h3>
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
          Not sure which tool you need?
        </h2>
        <p className="text-muted-foreground mt-2">
          Tell us about your business and we&apos;ll point you to the right
          one.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="accent" size="xl" render={<Link href="/#contact" />}>
            Let&apos;s talk
          </Button>
        </div>
      </div>
    </main>
  );
}
