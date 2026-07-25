import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FOUNDER } from '@/lib/config/founder';
import { SOCIAL_ICONS } from '@/lib/config/social';
import { MapPin, ShieldCheck, TrendingUp } from 'lucide-react';

const FOUNDER_IMPACT = [
  {
    title: 'Healthcare Platform',
    description: 'AI-powered clinical decision support that transformed healthcare delivery operations.',
    metrics: [
      { value: '83%', label: 'Subscription revenue growth' },
      { value: '3×', label: 'Client capacity increase' },
      { value: '76%', label: 'Infrastructure cost reduction' },
    ],
    icon: TrendingUp,
  },
  {
    title: 'Financial Services',
    description: 'Enterprise-grade analytics platform serving global investment firms with zero-downtime operations.',
    metrics: [
      { value: '400+', label: 'Funds managed' },
      { value: '7', label: 'New ESG clients onboarded' },
      { value: '0', label: 'Downtime incidents' },
    ],
    icon: ShieldCheck,
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            Meet the founder
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Who&apos;s behind this
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Built by an engineer who spent 15 years inside big tech, now
            obsessed with sorting the boring stuff for small business.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/20 flex-shrink-0">
                <Image
                  src="/founder.jpg"
                  alt={FOUNDER.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  priority
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="pt-1">
                <h3 className="text-2xl font-bold text-foreground">
                  {FOUNDER.name}
                </h3>
                <p className="text-accent font-medium text-sm">
                  {FOUNDER.title}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {FOUNDER.location}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {FOUNDER.shortBio}
            </p>
          </div>

          <div className="space-y-8">
            <div className="space-y-6 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <h4 className="text-lg font-semibold text-foreground">Engineering depth that scales</h4>
              </div>
              <p className="text-muted-foreground text-sm">
                The same rigour applied to CrewCircle apps has delivered results for larger projects too.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FOUNDER_IMPACT.map((story) => {
                  const Icon = story.icon;
                  return (
                    <div
                      key={story.title}
                      className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-accent/20 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Icon className="w-4.5 h-4.5 text-accent" />
                        </div>
                        <h5 className="text-base font-bold text-foreground">
                          {story.title}
                        </h5>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {story.description}
                      </p>

                      <div className="grid grid-cols-3 gap-3">
                        {story.metrics.map((metric) => (
                          <div key={metric.label}>
                            <div className="text-lg font-bold text-accent">
                              {metric.value}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                              {metric.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
