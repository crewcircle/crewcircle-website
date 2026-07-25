import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ChooseWorkforceSoftware() {
  return (
    <div className="min-h-screen bg-background py-12">
      <article className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="text-accent hover:text-accent/80 font-medium mb-8 inline-block">← Back to Blog</Link>
        <h1 className="text-4xl font-bold text-foreground mb-4">How to Choose the Right Workforce Management Software</h1>
        <p className="text-sm text-muted-foreground mb-8">April 18, 2026 • 5 min read</p>

        <div className="prose prose-gray max-w-none space-y-4 text-muted-foreground">
          <p>Picking workforce software is like hiring a new manager — get it wrong and you feel it every day. Here&apos;s what to look for.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">1. Does it handle Australian awards?</h2>
          <p>Half the software out there is built for US or UK markets. They don&apos;t know penalty rates, casual loading, or award classifications. If the system can&apos;t calculate the correct rate for a Saturday shift in the Hospitality Award, it&apos;s not fit for purpose.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">2. Is it actually easy to use?</h2>
          <p>Your tradies and waitstaff aren&apos;t desk workers. If the app requires training, they won&apos;t use it. Look for a mobile-first interface — clock in/out, shift swaps, and timesheets in under 30 seconds.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">3. Does it connect to your accounting software?</h2>
          <p>Manual data entry breeds mistakes. Xero, MYOB, QuickBooks — your rostering system should push timesheets straight into payroll. One click, not a CSV export and import dance.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">4. How&apos;s the support?</h2>
          <p>When your roster breaks at 6 AM Sunday, email support won&apos;t cut it. Ask about phone support hours and response times. Real humans who answer quickly.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">5. What does it cost (all of it)?</h2>
          <p>Watch for per-user fees that balloon as you grow. Some charge per employee per month, others a flat rate. Do the maths at your projected headcount, not today&apos;s.</p>

          <p className="mt-8 font-medium">Bottom line: if it handles awards, your team uses it, and it talks to your accounting software, you&apos;re most of the way there.</p>
        </div>

        <div className="mt-12 text-center">
          <Button variant="accent" size="xl" className="font-bold" render={<Link href="/" />}>Back to Home</Button>
        </div>
      </article>
    </div>
  );
}
