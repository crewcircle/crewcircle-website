import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'CardSnap - Business Cards That Sort Themselves',
  description: 'Finally, business cards that sort themselves. Scan a card, save it. Done. No dramas.',
};

export default function CardSnap() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
              CS
            </div>
            <span className="text-xl font-bold text-foreground">CardSnap</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</Link>
            <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="#download" className="text-muted-foreground hover:text-primary transition-colors">Download</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 text-center bg-background">
        <div className="container mx-auto px-6">
          <p className="text-muted-foreground mb-4">📷 Built for tradies, cafes & small biz</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Finally, business cards that<br /><span className="text-primary">sort themselves.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop typing contacts manually. Snap a card, save it. <span className="text-primary font-semibold">Done. No dramas.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="#download"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-md text-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Get it
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-3 border-2 border-foreground text-foreground rounded-md text-lg font-bold hover:border-primary hover:text-primary transition-colors"
            >
              Watch it work
            </Link>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-primary/10 rounded-2xl p-8">
              <div className="text-primary font-semibold mb-4">CardSnap in action</div>
              <div className="space-y-3 text-left">
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
              <div className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg inline-block">Scan Card</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50" id="how-it-works">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Sorted in Seconds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Point', desc: 'Point at any card. No setup, no account.' },
              { step: '2', title: 'Snap', desc: 'Tap once. OCR extracts everything instantly.' },
              { step: '3', title: 'Review', desc: 'Quick check. Fix if needed, takes seconds.' },
              { step: '4', title: 'Sorted', desc: 'Saved to contacts. Done. Next card!' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background" id="features">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Sorted in Seconds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📸', title: 'Contacts sorted in seconds', desc: 'Point, tap, done. Google ML Kit does the rest.' },
              { icon: '✅', title: 'Saved automatically', desc: 'Optionally auto-save after each scan. No taps wasted.' },
              { icon: '📇', title: 'Share anywhere', desc: 'Export as vCard or CSV. Send via any app.' },
              { icon: '🌐', title: 'Works in any language', desc: 'English, Chinese, German, French — sorted.' },
              { icon: '🔒', title: 'Your data stays put', desc: 'All on your phone. No servers, no dramas.' },
              { icon: '📱', title: 'Built for Android', desc: 'Native app. CameraX + Compose. Works flawless.' },
            ].map((feature) => (
              <div key={feature.title} className="bg-card border border-border rounded-lg p-6">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">What They Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { quote: 'Finally! No more typing business cards manually. Sorted in seconds.', author: 'Mick O\'Brien, Syd Plumbing Bros' },
              { quote: 'I was skeptical, but CardSnap actually works. No dramas.', author: 'Sarah Chen, Café Oasis' },
              { quote: 'Scan, save, done. Just like it should be.', author: 'Dave Wilson, Precision Electric' },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-card border border-border rounded-lg p-6">
                <p className="text-foreground mb-4">"{testimonial.quote}"</p>
                <p className="text-muted-foreground text-sm">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section className="py-20 bg-muted/50" id="download">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Sorted. Get it free.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Scan cards in seconds. Free forever. No account needed, no dramas.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://github.com/crewcircle/CardSnap/releases"
              className="px-6 py-3 bg-foreground text-background rounded-md font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
              target="_blank"
            >
              Get it
            </Link>
            <Link
              href="https://github.com/crewcircle/CardSnap"
              className="px-6 py-3 border-2 border-foreground text-foreground rounded-md font-bold hover:border-primary hover:text-primary transition-colors inline-flex items-center gap-2"
              target="_blank"
            >
              View Source
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Requires Android 8.0 (API 26) or higher</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p>&copy; 2024 CardSnap. Built by CrewCircle.</p>
          </div>
          <div className="flex gap-6">
            <Link href="https://github.com/crewcircle/CardSnap" className="text-background/70 hover:text-background transition-colors text-sm" target="_blank">GitHub</Link>
            <Link href="/cardsnap/privacy-policy" className="text-background/70 hover:text-background transition-colors text-sm">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
