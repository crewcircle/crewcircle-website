import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Terms of Service — CrewCircle',
  description:
    'Terms of Service for CrewCircle Pty Ltd and the CrewCircle apps.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Terms of Service
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          Last updated: July 20, 2026
        </p>

        <div className="space-y-8 text-foreground">
          <p className="leading-relaxed">
            These Terms of Service (&quot;Terms&quot;) govern your use of the
            CrewCircle website and apps operated by CrewCircle Pty Ltd (ABN 86
            699 000 5064). By using our services, you agree to these Terms. If
            you do not agree, please do not use our services.
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              1. Services we provide
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              CrewCircle builds practical AI tools for Australian small
              businesses. Our apps include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>
                <strong>TaxFlowAI</strong> — ATO tax research and advisory AI for accounting firms.
              </li>
              <li>
                <strong>LocalMate</strong> — local business automation for Australian SMBs.
              </li>
              <li>
                <strong>CrewRoster</strong> — rostering and timesheets for shift-based crews.
              </li>
              <li>
                <strong>SmartGL</strong> — AI bookkeeping with Australian GST in mind.
              </li>
              <li>
                <strong>CardSnap</strong> — free business-card scanner.
              </li>
              <li>
                <strong>AuRate</strong> — free ATO admin Chrome sidekick.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              2. Accounts and eligibility
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 18 years old to create an account. You are
              responsible for keeping your login details secure and for all
              activity that happens under your account. Tell us immediately if
              you suspect unauthorised access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              3. Acceptable use
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to use our services only for lawful purposes. You must
              not:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
              <li>Upload or process illegal, harmful, or infringing content.</li>
              <li>Reverse engineer, scrape, or interfere with our systems.</li>
              <li>Send spam or harass other users through our services.</li>
              <li>Use our AI outputs as legal, medical, or financial advice without independent review.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              4. Billing and subscriptions
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Some CrewCircle apps are paid services. Prices are shown in the
              app or on our pricing page and are billed as advertised. You can
              cancel at any time through your account settings. We do not offer
              refunds unless required by Australian consumer law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              5. AI-generated content
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our apps may generate content using AI. You are responsible for
              reviewing AI outputs before using them for business or compliance
              purposes. We do not guarantee that AI outputs are accurate,
              complete, or suitable for your specific situation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              6. Intellectual property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              CrewCircle owns the website, apps, branding, and original content.
              You retain ownership of the data you upload. We only use your data
              to provide the service, as described in our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              7. Third-party integrations
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Some apps connect to third-party services (for example, Google
              Business Profile, Square, Stripe, Cliniko, Xero, or the ATO). Your
              use of those services is governed by their own terms. We are not
              responsible for their availability or actions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              8. Disclaimers and liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Our services are provided on an &quot;AS IS&quot; and &quot;AS
              AVAILABLE&quot; basis. To the extent permitted by Australian law,
              CrewCircle is not liable for indirect, incidental, or consequential
              damages arising from your use of the services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              9. Termination
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your account if you breach these
              Terms. You can close your account at any time. On closure, we will
              delete your data in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              10. Governing law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of New South Wales,
              Australia. Any disputes will be resolved in the courts of New South
              Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              11. Changes to these Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms from time to time. We will notify you of
              material changes by email or through the affected app. Continued
              use after changes means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              12. Contact us
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              If you have questions about these Terms:
            </p>
            <ul className="list-none space-y-1 text-muted-foreground">
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:legal@crewcircle.com.au"
                  className="text-accent hover:underline"
                >
                  legal@crewcircle.com.au
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
