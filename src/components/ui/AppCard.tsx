'use client';

import Link from 'next/link';
import { AppDef } from '@/lib/constants';

interface AppCardProps {
  app: AppDef;
  index: number;
}

export default function AppCard({ app, index }: AppCardProps) {
  return (
    <div className="bg-background border-2 border-foreground/20 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold">
          {app.icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{app.name}</h3>
          <p className="text-sm text-muted-foreground">{app.slug}</p>
        </div>
      </div>

      <p className="text-foreground mb-4 text-sm">{app.oneLiner}</p>

      <ul className="space-y-2 mb-6">
        {app.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-foreground">
            <span className="text-primary">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        {app.links.web && (
          <Link
            href={app.links.web}
            className="block w-full text-center px-5 py-3 bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
          >
            Visit
          </Link>
        )}

        {app.ctaType === 'demo' && (
          <Link
            href="/demo"
            className="block w-full text-center px-5 py-3 bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90"
          >
            Try it
          </Link>
        )}

        {app.ctaType === 'download' && (
          <div className="flex gap-2">
            {app.links.appStore && (
              <Link
                href={app.links.appStore}
                className="flex-1 text-center px-3 py-3 bg-foreground text-background text-sm font-bold hover:bg-foreground/90"
              >
                App Store
              </Link>
            )}
            {app.links.playStore && (
              <Link
                href={app.links.playStore}
                className="flex-1 text-center px-3 py-3 bg-foreground text-background text-sm font-bold hover:bg-foreground/90"
              >
                Play Store
              </Link>
            )}
            {app.links.chromeStore && (
              <Link
                href={app.links.chromeStore}
                className="flex-1 text-center px-3 py-3 bg-foreground text-background text-sm font-bold hover:bg-foreground/90"
              >
                Chrome
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
