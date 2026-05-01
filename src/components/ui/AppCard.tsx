'use client';

import Link from 'next/link';
import { AppDef } from '@/lib/constants';

interface AppCardProps {
  app: AppDef;
  index: number;
}

export default function AppCard({ app, index }: AppCardProps) {
  const bgColor = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  }[app.theme];

  const borderHover = {
    orange: 'hover:border-orange-400',
    blue: 'hover:border-blue-400',
    green: 'hover:border-green-400',
    purple: 'hover:border-purple-400',
  }[app.theme];

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl ${borderHover} animate-fade-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
       <div className="flex items-center gap-3 mb-4">
         <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center text-2xl`}>
           <span className={`text-${app.theme}-600`}>{app.icon}</span>
         </div>
         <div>
           <h3 className="text-xl font-bold text-gray-900">{app.name}</h3>
           <p className="text-sm text-gray-500">{app.slug}</p>
         </div>
       </div>

      <p className="text-gray-600 mb-4">{app.oneLiner}</p>

      <ul className="space-y-2 mb-6">
        {app.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-green-500">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        {app.ctaType === 'demo' && (
          <Link
            href="/demo"
            className={`block w-full text-center px-6 py-3 bg-${app.theme}-500 text-white rounded-xl font-bold hover:bg-${app.theme}-600 transition-all`}
          >
            Try Demo
          </Link>
        )}

        {app.ctaType === 'visit' && (
          <Link
            href={app.links.web || '#'}
            className={`block w-full text-center px-6 py-3 border-2 border-${app.theme}-500 text-${app.theme}-600 rounded-xl font-bold hover:bg-${app.theme}-50 transition-all`}
          >
            Visit →
          </Link>
        )}

        {app.ctaType === 'download' && (
          <div className="flex gap-2">
            {app.links.appStore && (
              <Link
                href={app.links.appStore}
                className="flex-1 text-center px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all"
              >
                App Store
              </Link>
            )}
            {app.links.playStore && (
              <Link
                href={app.links.playStore}
                className="flex-1 text-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
              >
                Play Store
              </Link>
            )}
            {app.links.chromeStore && (
              <Link
                href={app.links.chromeStore}
                className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
              >
                Chrome Store
              </Link>
            )}
          </div>
        )}

        {app.links.web && (
          <p className="text-xs text-gray-400 text-center">{app.links.web}</p>
        )}
      </div>
    </div>
  );
}
