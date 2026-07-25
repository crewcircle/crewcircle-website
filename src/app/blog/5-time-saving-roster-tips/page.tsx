import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FiveTimeSavingRosterTips() {
  return (
    <div className="min-h-screen bg-background py-12">
      <article className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="text-accent hover:text-accent/80 font-medium mb-8 inline-block">← Back to Blog</Link>
        <h1 className="text-4xl font-bold text-foreground mb-4">5 Time-Saving Roster Tips for Cafés and Tradies</h1>
        <p className="text-sm text-muted-foreground mb-8">May 1, 2026 • 4 min read</p>

        <div className="prose prose-gray max-w-none space-y-4 text-muted-foreground">
          <p>Rostering eats hours every week. Here&apos;s how to claw them back.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">1. Use template rosters</h2>
          <p>Most weeks look the same. Build a template roster for each season or shift pattern. Tweak, don&apos;t rebuild. CrewCircle stores your templates so Monday morning doesn&apos;t start from scratch.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">2. Let your team request shifts</h2>
          <p>Stop playing middleman. Let staff log preferences and availability in-app. Fill gaps from the people who actually want them.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">3. Automate shift swapping</h2>
          <p>When someone calls in sick, don&apos;t scroll through a contact list. CrewCircle notifies eligible replacements automatically. Swap approved, no phone tag.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">4. Set award rate defaults</h2>
          <p>Penalty rates, overtime, public holidays — set them once per role. The system applies the correct pay rate every time. No more manual calculations.</p>

          <h2 className="text-2xl font-semibold text-foreground mt-8">5. Publish rosters early</h2>
          <p>Get the roster out 7 days ahead. Staff confirm, you get certainty, and you avoid last-minute &quot;I didn&apos;t know I was working&quot; drama.</p>
        </div>

        <div className="mt-12 text-center">
          <Button variant="accent" size="xl" className="font-bold" render={<Link href="/" />}>Back to Home</Button>
        </div>
      </article>
    </div>
  );
}
