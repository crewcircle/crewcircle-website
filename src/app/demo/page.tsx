'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEMO_CONFIG } from '@/lib/constants';

export default function DemoPage() {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupDemo = async () => {
    setIsSettingUp(true);
    setError(null);
    try {
      const response = await fetch('/api/demo', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setIsReady(true);
      } else {
        setError(data.error || 'Failed to set up demo');
      }
    } catch {
      setError('Failed to set up demo. Please try again.');
    } finally {
      setIsSettingUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <Link href="/" className="text-2xl font-black text-orange-500">
          CrewCircle
        </Link>
        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors">
          Back to home
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{DEMO_CONFIG.heading}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {DEMO_CONFIG.subheading}{' '}
            <span className="font-semibold text-orange-600">{DEMO_CONFIG.orgName}</span> in{' '}
            {DEMO_CONFIG.orgLocation}.
          </p>
          <p className="text-sm text-gray-500 mt-2">{DEMO_CONFIG.note}</p>
        </div>

        {!isReady ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{DEMO_CONFIG.orgName}</h2>
              <p className="text-gray-600">A fictional cafe in {DEMO_CONFIG.orgLocation} with {DEMO_CONFIG.users.length} team members</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={setupDemo}
              disabled={isSettingUp}
              className="px-8 py-4 bg-orange-500 text-white rounded-xl text-lg font-bold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSettingUp ? 'Setting up demo...' : 'Set Up Demo Organization'}
            </button>

            <p className="mt-4 text-sm text-gray-500">
              This will create a demo cafe with {DEMO_CONFIG.users.length} users, rosters, shifts, and clock events
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Demo Ready!</h2>
                  <p className="text-gray-600">Click a user below to explore their view</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEMO_CONFIG.users.map((user) => (
                  <div
                    key={user.role}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${user.color}-100`}>
                        <span className={`text-xl font-bold text-${user.color}-600`}>
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full bg-${user.color}-100 text-${user.color}-700`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                  <span className="font-semibold">💡 Demo Mode:</span> You&apos;re exploring part of the CrewCircle suite.
                  All actions are simulated — no real data is affected.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
