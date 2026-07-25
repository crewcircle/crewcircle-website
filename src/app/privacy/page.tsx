import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Privacy Policy — CrewCircle',
  description:
    'How CrewCircle collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Privacy Policy
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Last updated: July 20, 2026
        </p>

        <div className="space-y-8 text-foreground">
          <p className="leading-relaxed">
            CrewCircle Pty Ltd (ABN 86 699 000 5064) (“we”, “us”, or “our”)
            respects your privacy. This policy explains what information we
            collect, how we use it, who we share it with, and how you can access
            or delete it.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. What we collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We only collect what we need to run the service.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>Account details:</strong> name, email address, business
                name, and suburb when you sign up.
              </li>
              <li>
                <strong>Business data you add:</strong> review replies, keywords,
                competitor URLs, menu items, staff details, or tax documents you
                upload. This stays associated with your account.
              </li>
              <li>
                <strong>Usage data:</strong> app logs, feature usage, and error
                reports to keep the service reliable.
              </li>
              <li>
                <strong>Device data:</strong> browser type, IP address, and
                operating system for security and analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. How we use your information
            </h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To provide and improve our apps (TaxFlowAI, LocalMate, CrewRoster, SmartGL, CardSnap, AuRate).</li>
              <li>To send account updates, invoices, and optional product news.</li>
              <li>To detect abuse, fraud, and security issues.</li>
              <li>To understand which features are useful so we can prioritise work.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. AI processing
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Some CrewCircle apps use third-party AI providers (for example,
              Anthropic) to draft replies, summarise documents, or generate
              reports. We only send the minimum data required for each task. We
              do not use your data to train third-party AI models.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Who we share data with
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We only share it with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Cloud hosting and database providers that run our infrastructure.</li>
              <li>Payment processors (Stripe) to handle billing.</li>
              <li>Email and SMS delivery services for notifications you request.</li>
              <li>Analytics and error-tracking services to keep the service stable.</li>
              <li>Regulators or law enforcement if we are legally required to do so.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. Where data is stored
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Data is stored in secure cloud regions, primarily in Australia and
              the United States, depending on the service provider. We use
              encryption in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. How long we keep data
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We keep your data for as long as your account is active. If you
              delete your account, we remove or anonymise your data within 30
              days, except where we are required to keep it for legal or tax
              reasons.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Your rights
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You can:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Access, update, or delete your account data at any time.</li>
              <li>Export your data where the app supports it.</li>
              <li>Opt out of marketing emails.</li>
              <li>Contact us if you believe your data is incorrect.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Cookies and analytics
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and analytics to understand how visitors use our
              website. You can disable analytics in your browser or through our
              cookie banner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Changes to this policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy. If we make a material change,
              we will notify you by email or through the affected app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. Contact us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              Questions or requests about your privacy:
            </p>
            <ul className="list-none space-y-1 text-muted-foreground">
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:privacy@crewcircle.com.au"
                  className="text-accent hover:underline"
                >
                  privacy@crewcircle.com.au
                </a>
              </li>
              <li>
                <strong>Post:</strong> CrewCircle Pty Ltd, Sydney NSW Australia
              </li>
              <li>
                <strong>ABN:</strong> 86 699 000 5064
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
