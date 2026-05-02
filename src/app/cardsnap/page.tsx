import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'CardSnap - Scan Business Cards Instantly',
  description: 'Scan any business card in seconds and save contacts automatically to your phone.',
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Scan a card.<br /><span className="text-primary">Save a contact.</span> Done.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            CardSnap instantly scans business cards and saves contacts to your phone. No account needed. Everything happens on your device.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="#download"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-md text-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Download Free
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-3 border-2 border-foreground text-foreground rounded-md text-lg font-bold hover:border-primary hover:text-primary transition-colors"
            >
              Learn More
            </Link>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-primary/10 rounded-2xl p-8">
              <div className="text-primary font-semibold mb-4">CardSnap Demo</div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Open & Point', desc: 'Open CardSnap and point your camera at any business card.' },
              { step: '2', title: 'Tap Scan', desc: 'Tap the scan button. CardSnap instantly captures and processes the card.' },
              { step: '3', title: 'Review & Save', desc: 'Review the extracted contact details, make corrections, and save.' },
              { step: '4', title: 'Done!', desc: 'Contact saved! Ready to scan the next card in seconds.' },
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
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📸', title: 'Smart OCR', desc: 'Google ML Kit extracts text with high accuracy from business cards.' },
              { icon: '✅', title: 'Auto-Save', desc: 'Optionally save contacts automatically after each scan.' },
              { icon: '📇', title: 'Export & Share', desc: 'Export contacts as vCard (.vcf) or CSV. Share via any app.' },
              { icon: '🌐', title: 'Multi-Language OCR', desc: 'Supports English, Chinese, German, French, Spanish, and more.' },
              { icon: '🔒', title: 'Privacy First', desc: 'All processing on-device. No data sent to external servers.' },
              { icon: '📱', title: 'Native Android', desc: 'Built with Jetpack Compose and CameraX for best experience.' },
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

      {/* Download */}
      <section className="py-20 bg-muted/50" id="download">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get CardSnap Free</h2>
          <p className="text-muted-foreground mb-8">Download from GitHub Releases or install directly from the APK file.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://github.com/crewcircle/CardSnap/releases"
              className="px-6 py-3 bg-foreground text-background rounded-md font-bold hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
              target="_blank"
            >
              GitHub Releases
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
            <Link href="/card-snap/privacy" className="text-background/70 hover:text-background transition-colors text-sm">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
