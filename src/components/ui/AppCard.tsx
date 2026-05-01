'use client';

import Link from 'next/link';
import { AppDef } from '@/lib/constants';

interface AppCardProps {
  app: AppDef;
  index: number;
}

export default function AppCard({ app, index }: AppCardProps) {
  return (
    <div
      className="group bg-card rounded-lg border border-border hover:border-primary/50 p-6 transition-all hover:shadow-md animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 bg-primary/15 text-primary rounded-xl flex items-center justify-center text-3xl font-bold">
          {app.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{app.name}</h3>
          <p className="text-sm text-muted-foreground">{app.slug}</p>
        </div>
      </div>

      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">{app.oneLiner}</p>

      <ul className="space-y-2 mb-6">
        {app.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-green-500 text-xs">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        {app.ctaType === 'demo' && (
          <Link
            href="/demo"
            className="block w-full text-center px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-colors hover:bg-primary/90"
          >
            Try Demo
          </Link>
        )}

        {app.ctaType === 'visit' && (
          <Link
            href={app.links.web || '#'}
            className="block w-full text-center px-5 py-2.5 border-2 border-primary text-primary rounded-lg text-sm font-medium transition-colors hover:bg-primary/10"
          >
            Visit →
          </Link>
        )}

        {app.ctaType === 'download' && (
          <div className="flex gap-2">
            {app.links.appStore && (
              <Link
                href={app.links.appStore}
                className="flex-1 text-center px-3 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                App Store
              </Link>
            )}
            {app.links.playStore && (
              <Link
                href={app.links.playStore}
                className="flex-1 text-center px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Play Store
              </Link>
            )}
            {app.links.chromeStore && (
              <Link
                href={app.links.chromeStore}
                className="flex-1 text-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Chrome Store
              </Link>
            )}
          </div>
        )}

        {app.links.web && (
          <p className="text-xs text-muted-foreground text-center truncate">{app.links.web}</p>
        )}
      </div>
    </div>
  );
}
