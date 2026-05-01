import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Blog</h1>
        <p className="text-lg text-gray-600 mb-8">
Stay updated with the latest news, tips, and insights for Australian small businesses.
           From rostering hacks to accounting advice, we&apos;ve got you sorted.
        </p>
        
        <div className="space-y-8">
          <div className="border-b pb-6 last:border-b-0">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              5 Time-Saving Roster Tips for Cafés and Tradies
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              May 1, 2026 • 4 min read
            </p>
            <p className="text-gray-700 mb-4">
              Learn how to streamline your scheduling process with these practical tips that
              save hours each week. From template rosters to shift swapping, discover what
              works for Aussie small businesses.
            </p>
            <Link href="/blog/5-time-saving-roster-tips" className="text-orange-600 hover:text-orange-500 font-medium">
              Read more →
            </Link>
          </div>
          
          <div className="border-b pb-6 last:border-b-0">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              GST Made Simple: A Guide for Australian Small Business
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              April 25, 2026 • 6 min read
            </p>
            <p className="text-gray-700 mb-4">
              Understanding GST doesn&apos;t have to be complicated. We break down the essentials
              you need to know to stay compliant and avoid costly mistakes.
            </p>
            <Link href="/blog/gst-made-simple" className="text-orange-600 hover:text-orange-500 font-medium">
              Read more →
            </Link>
          </div>
          
          <div className="border-b pb-6 last:border-b-0">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              How to Choose the Right Workforce Management Software
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              April 18, 2026 • 5 min read
            </p>
            <p className="text-gray-700 mb-4">
                With so many options available, finding the perfect fit for your business can
                be overwhelming. Here&apos;s our framework for evaluating workforce management tools.
            </p>
            <Link href="/blog/choose-workforce-software" className="text-orange-600 hover:text-orange-500 font-medium">
              Read more →
            </Link>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/" className="px-6 py-3 bg-orange-500 text-white rounded-lg text-md font-bold hover:bg-orange-600 transition-all">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
