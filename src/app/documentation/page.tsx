import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { APPS } from '@/lib/config/apps';

export const metadata: Metadata = {
  title: 'Documentation — CrewCircle',
  description:
    'Guides and getting-started resources for CrewCircle apps.',
};

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Documentation
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Getting-started guides and help for each CrewCircle app. Select the app
          you are using below.
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              App guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {APPS.map((app) => (
                <Link
                  key={app.slug}
                  href={
                    app.links.web && !app.links.web.startsWith('#')
                      ? app.links.web
                      : `/#${app.slug}`
                  }
                  className="rounded-xl border border-border bg-background p-5 hover:border-accent hover:shadow-sm transition-all"
                >
                  <h3 className="font-semibold text-foreground">{app.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {app.oneLiner}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Common questions
            </h2>
            <div className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  How do I sign up?
                </h3>
                <p className="leading-relaxed">
                  Visit the app page and click the sign-up link. LocalMate offers
                  a 14-day free trial with no credit card required. For TaxFlowAI,
                  request access and we will set up your firm account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  What data can I export?
                </h3>
                <p className="leading-relaxed">
                  Most paid apps let you export reports, timesheets, or ledger
                  entries from your dashboard. Export options are listed in each
                  app&apos;s Settings or Reports page.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  How do I cancel or change my plan?
                </h3>
                <p className="leading-relaxed">
                  You can cancel or upgrade from your account settings at any
                  time. If you get stuck, email us and we will handle it.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Which apps are live today?
                </h3>
                <p className="leading-relaxed">
                  TaxFlowAI, LocalMate, and CrewRoster are live now. SmartGL,
                  CardSnap, and AuRate are in beta and launching in August 2026.
                  Join the waitlist from the home page if you want early access.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Need help?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you cannot find what you need, contact us directly.
            </p>
            <ul className="list-none space-y-1 text-muted-foreground">
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:help@crewcircle.com.au"
                  className="text-accent hover:underline"
                >
                  help@crewcircle.com.au
                </a>
              </li>
              <li>
                <strong>Book a call:</strong>{' '}
                <a
                  href="https://calendly.com/sensible-analytic/30min"
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Calendly
                </a>
              </li>
              <li>
                <strong>GitHub:</strong>{' '}
                <a
                  href="https://github.com/crewcircle"
                  className="text-accent hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/crewcircle
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Button variant="accent" size="xl" render={<Link href="/" />}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
