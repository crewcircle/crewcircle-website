import Link from 'next/link';
import { FOOTER_LINKS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <h4 className="text-white font-semibold mb-4">Apps</h4>
          <ul className="space-y-2">
            {FOOTER_LINKS.apps.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2">
            {FOOTER_LINKS.legal.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm hover:text-orange-400 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Ready to sort your business?</h4>
          <p className="text-sm mb-4">Software that sorts your small biz, no dramas.</p>
            <Link
              href="/demo"
              className="inline-block px-5 py-2 bg-orange-500 text-white rounded-md text-sm font-bold hover:bg-orange-600 transition-colors"
            >
            Try Crew Roster Demo
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} CrewCircle. All rights reserved. Software that sorts your small biz, no dramas.</p>
      </div>
    </footer>
  );
}
