import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-foreground mb-8">Our Blog</h1>
        <p className="text-lg text-muted-foreground mb-8">
Stay updated with the latest news, tips, and insights for Australian small businesses.
           From rostering hacks to accounting advice, we&apos;ve got you sorted.
        </p>
        
        <div className="space-y-8">
          <div className="border-b border-border pb-6 last:border-b-0">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              5 Time-Saving Roster Tips for Cafés and Tradies
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              May 1, 2026 • 4 min read
            </p>
            <p className="text-muted-foreground mb-4">
              Learn how to streamline your scheduling process with these practical tips that
              save hours each week. From template rosters to shift swapping, discover what
              works for Aussie small businesses.
            </p>
            <Link href="/blog/5-time-saving-roster-tips" className="text-accent hover:text-accent/80 font-medium">
              Read more →
            </Link>
          </div>
          
          <div className="border-b border-border pb-6 last:border-b-0">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              GST Made Simple: A Guide for Australian Small Business
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              April 25, 2026 • 6 min read
            </p>
            <p className="text-muted-foreground mb-4">
              Understanding GST doesn&apos;t have to be complicated. We break down the essentials
              you need to know to stay compliant and avoid costly mistakes.
            </p>
            <Link href="/blog/gst-made-simple" className="text-accent hover:text-accent/80 font-medium">
              Read more →
            </Link>
          </div>
          
          <div className="border-b border-border pb-6 last:border-b-0">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              How to Choose the Right Workforce Management Software
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              April 18, 2026 • 5 min read
            </p>
            <p className="text-muted-foreground mb-4">
                With so many options available, finding the perfect fit for your business can
                be overwhelming. Here&apos;s our framework for evaluating workforce management tools.
            </p>
            <Link href="/blog/choose-workforce-software" className="text-accent hover:text-accent/80 font-medium">
              Read more →
            </Link>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Button variant="accent" size="xl" className="font-bold" render={<Link href="/" />}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
