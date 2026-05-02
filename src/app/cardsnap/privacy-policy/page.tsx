import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | CardSnap',
  description: 'CardSnap privacy policy - how we handle your scanned contact data',
};

export default function CardSnapPrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/card-snap" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to CardSnap</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: April 5, 2026</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Overview</h2>
            <p className="text-foreground leading-relaxed">
              CardSnap (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we handle information when you use our CardSnap mobile application (&quot;App&quot;).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-foreground mb-3">Information You Provide</h3>
            <ul className="list-disc list-inside text-foreground space-y-2 mb-6">
              <li>
                <strong>Scanned Contact Data:</strong> When you scan a business card, the extracted contact
                information is stored locally on your device.
              </li>
              <li>
                <strong>Account Information:</strong> If you choose to sync contacts, we may collect minimal
                account data.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-foreground space-y-2 mb-6">
              <li>
                <strong>Device Information:</strong> We collect basic device information (Android version, device
                model) for crash reporting.
              </li>
              <li>
                <strong>Usage Data:</strong> We may collect anonymous usage statistics to improve the app.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-foreground mb-3">Camera Access</h3>
            <ul className="list-disc list-inside text-foreground space-y-2">
              <li>CardSnap requires camera access to scan business cards.</li>
              <li>Camera images are processed locally on your device and are not uploaded to any server.</li>
              <li>OCR processing happens entirely on-device using Google ML Kit.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <p className="text-foreground mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-foreground space-y-2">
              <li>Provide, maintain, and improve the CardSnap app</li>
              <li>Process and save scanned business card data to your device</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Storage</h2>
            <ul className="list-disc list-inside text-foreground space-y-2">
              <li>
                <strong>All scanned data is stored locally on your device</strong> using Room Database.
              </li>
              <li>
                <strong>No data is sent to our servers</strong> during normal app operation.
              </li>
              <li>
                <strong>Settings are stored locally</strong> using Android DataStore Preferences.
              </li>
              <li>
                You can delete all stored data at any time through the app&apos;s{' '}
                <strong>Settings &gt; Reset All Data</strong>.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sharing</h2>
            <p className="text-foreground">
              We do not sell, trade, or otherwise transfer your personal information to outside parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Third-Party Services</h2>
            <p className="text-foreground mb-4">CardSnap uses the following third-party services:</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border px-4 py-2 text-left text-foreground">Service</th>
                    <th className="border border-border px-4 py-2 text-left text-foreground">Purpose</th>
                    <th className="border border-border px-4 py-2 text-left text-foreground">Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border px-4 py-2 text-foreground">Google ML Kit</td>
                    <td className="border border-border px-4 py-2 text-foreground">On-device OCR text recognition</td>
                    <td className="border border-border px-4 py-2">
                      <a
                        href="https://policies.google.com/privacy"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google Privacy
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-border px-4 py-2 text-foreground">Google Play Services</td>
                    <td className="border border-border px-4 py-2 text-foreground">App functionality</td>
                    <td className="border border-border px-4 py-2">
                      <a
                        href="https://policies.google.com/privacy"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Google Privacy
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
            <p className="text-foreground mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-foreground space-y-2">
              <li>Access your stored data (all data is stored locally on your device)</li>
              <li>Delete your stored data (Settings &gt; Reset All Data)</li>
              <li>Revoke camera or contacts permissions at any time through device settings</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Children&apos;s Privacy</h2>
            <p className="text-foreground">
              CardSnap does not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
            <p className="text-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-foreground mb-2">If you have questions about this Privacy Policy, please contact us:</p>
            <ul className="list-none space-y-2 text-foreground">
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@cardsnap.app" className="text-primary hover:underline">
                  privacy@cardsnap.app
                </a>
              </li>
              <li>
                <strong>GitHub:</strong>{' '}
                <a
                  href="https://github.com/crewcircle/CardSnap"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.com/crewcircle/CardSnap
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
