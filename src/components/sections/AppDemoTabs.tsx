'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { APPS } from '@/lib/config/apps';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calculator, Users, Timer } from 'lucide-react';

const demos = [
  {
    slug: 'taxflowai',
    gif: '/demos/taxflowai-demo.gif',
    label: 'TaxFlow',
    icon: Calculator,
  },
  {
    slug: 'localmate',
    gif: '/demos/localmate-demo.gif',
    label: 'LocalMate',
    icon: Users,
  },
  {
    slug: 'crewroster',
    gif: '/demos/crewroster-demo.gif',
    label: 'CrewRoster',
    icon: Timer,
  },
];

export default function AppDemoTabs() {
  const [active, setActive] = useState(demos[0].slug);
  const activeDemo = demos.find((d) => d.slug === active)!;
  const app = APPS.find((a) => a.slug === active)!;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex border-b border-border">
        {demos.map((demo) => (
          <button
            key={demo.slug}
            onClick={() => setActive(demo.slug)}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors flex items-center gap-2 ${
              active === demo.slug
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <demo.icon className="w-4 h-4" />
            {demo.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-0">
        <div className="lg:col-span-2 relative aspect-[4/3] lg:aspect-video bg-muted">
          <Image
            src={activeDemo.gif}
            alt={`${app.name} demo`}
            fill
            unoptimized
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 66vw"
            priority
          />
        </div>

        <div className="p-6 lg:p-8 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">{app.name}</h3>
          <p className="text-accent font-medium mb-3">{app.oneLiner}</p>
          <p className="text-muted-foreground leading-relaxed mb-4">{app.description}</p>
          <ul className="space-y-2 mb-6">
            {app.features.slice(0, 4).map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {app.links.web && (
            <Button
              variant="default"
              className="w-full md:w-auto hover:bg-accent hover:text-accent-foreground"
              render={<Link href={app.links.web} />}
            >
              Try {app.name}
              <ArrowRight className="w-4 h-4 ml-1 group-hover/button:translate-x-0.5 transition-transform" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
