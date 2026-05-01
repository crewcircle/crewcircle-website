'use client';

import Link from 'next/link';
import { AppDef } from '@/lib/constants';

interface AppCardProps {
  app: AppDef;
  index: number;
}

export default function AppCard({ app, index }: AppCardProps) {
  const themeStyles = {
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      hoverBorder: 'hover:border-orange-300',
      button: 'bg-orange-500 hover:bg-orange-600',
      buttonOutline: 'border-orange-500 text-orange-600 hover:bg-orange-50',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hoverBorder: 'hover:border-blue-300',
      button: 'bg-blue-500 hover:bg-blue-600',
      buttonOutline: 'border-blue-500 text-blue-600 hover:bg-blue-50',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      hoverBorder: 'hover:border-green-300',
      button: 'bg-green-500 hover:bg-green-600',
      buttonOutline: 'border-green-500 text-green-600 hover:bg-green-50',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      hoverBorder: 'hover:border-purple-300',
      button: 'bg-purple-500 hover:bg-purple-600',
      buttonOutline: 'border-purple-500 text-purple-600 hover:bg-purple-50',
    },
  }[app.theme];

  return (
    <div
      className={`group bg-white rounded-lg border ${themeStyles.border} ${themeStyles.hoverBorder} p-6 transition-all hover:shadow-md animate-fade-in`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${themeStyles.bg} ${themeStyles.text} rounded-lg flex items-center justify-center text-xl`}>
          {app.icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
          <p className="text-sm text-gray-500">{app.slug}</p>
        </div>
      </div>

      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{app.oneLiner}</p>

      <ul className="space-y-2 mb-6">
        {app.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-green-500 text-xs">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        {app.ctaType === 'demo' && (
          <Link
            href="/demo"
            className={`block w-full text-center px-5 py-2.5 ${themeStyles.button} text-white rounded-lg text-sm font-medium transition-colors`}
          >
            Try Demo
          </Link>
        )}

        {app.ctaType === 'visit' && (
          <Link
            href={app.links.web || '#'}
            className={`block w-full text-center px-5 py-2.5 border-2 ${themeStyles.buttonOutline} rounded-lg text-sm font-medium transition-colors`}
          >
            Visit →
          </Link>
        )}

        {app.ctaType === 'download' && (
          <div className="flex gap-2">
            {app.links.appStore && (
              <Link
                href={app.links.appStore}
                className="flex-1 text-center px-3 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
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
          <p className="text-xs text-gray-400 text-center truncate">{app.links.web}</p>
        )}
      </div>
    </div>
  );
}
