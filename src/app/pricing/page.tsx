import type { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRICING_SECTIONS, FREE_TOOLS_BLURB } from '@/lib/config/pricing';

export const metadata: Metadata = {
  title: 'Pricing — CrewCircle',
  description:
    'Transparent pricing for TaxFlowAI and LocalMate. Start with a 14-day free trial, or request access for firm-grade tax research.',
};

function formatPrice(price: number, period: string): string {
  if (price === 0) return 'Free';
  return `$${price.toLocaleString('en-AU')}/${period}`;
}

export default function PricingPage() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-accent">
          Pricing
        </span>
        <h1 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">
          Transparent pricing.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          No hidden tiers, no surprise add-ons. Each app is priced separately so
          you pay for what you actually use.
        </p>

        <div className="mt-16 space-y-20">
          {PRICING_SECTIONS.map((section) => (
            <div key={section.appSlug}>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground">
                  {section.appName}
                </h2>
                <p className="mt-2 text-muted-foreground max-w-3xl">
                  {section.description}
                </p>
                {section.note && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {section.note}
                  </p>
                )}
              </div>

              <div
                className={`grid grid-cols-1 gap-6 ${
                  section.tiers.length === 2
                    ? 'md:grid-cols-2'
                    : 'md:grid-cols-3'
                }`}
              >
                {section.tiers.map((tier) => {
                  const isHighlighted = tier.highlight === true;

                  return (
                    <div
                      key={tier.name}
                      className={
                        isHighlighted
                          ? 'rounded-2xl border border-accent bg-accent text-accent-foreground p-8 flex flex-col'
                          : 'rounded-2xl border border-border bg-background p-8 flex flex-col'
                      }
                    >
                      <h3 className="text-xl font-semibold">{tier.name}</h3>

                      <div className="mt-4">
                        <span className="text-4xl font-bold">
                          {formatPrice(tier.price, tier.period)}
                        </span>
                      </div>

                      <p
                        className={
                          isHighlighted
                            ? 'mt-2 text-sm text-accent-foreground/80'
                            : 'mt-2 text-sm text-muted-foreground'
                        }
                      >
                        {tier.blurb}
                      </p>

                      <div
                        className={
                          isHighlighted
                            ? 'mt-6 border-t border-accent-foreground/20'
                            : 'mt-6 border-t border-border'
                        }
                      />

                      <ul className="mt-6 space-y-3">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <Check
                              className={
                                isHighlighted
                                  ? 'w-5 h-5 shrink-0 text-accent-foreground'
                                  : 'w-5 h-5 shrink-0 text-accent'
                              }
                            />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto pt-6">
                        <Button
                          variant={isHighlighted ? 'default' : 'accent'}
                          size="xl"
                          className="w-full"
                          render={<Link href={tier.cta.href} />}
                        >
                          {tier.cta.label}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl border border-border bg-muted/30 p-8">
          <h2 className="text-xl font-semibold text-foreground">Free tools</h2>
          <p className="mt-2 text-muted-foreground">{FREE_TOOLS_BLURB}</p>
        </div>

        <p className="mt-12 text-center text-muted-foreground">
          Not sure which plan fits?{' '}
          <Button variant="link" render={<Link href="/#contact" />}>
            Let&apos;s talk
          </Button>
        </p>
      </div>
    </section>
  );
}
