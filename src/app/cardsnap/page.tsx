'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, Check, Share2, Globe, Lock, Smartphone, ScanLine, ArrowRight, Code2, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Download', href: '#download' },
];

export default function CardSnap() {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <span className="text-xl font-bold text-foreground">CardSnap</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls="cardsnap-mobile-menu"
            aria-label="Toggle navigation menu"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-foreground hover:text-primary transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={closeMenu}>
          <div
            id="cardsnap-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute top-0 right-0 w-64 h-full bg-background border-l border-border p-6 flex flex-col gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close menu"
                className="inline-flex items-center justify-center w-10 h-10 text-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="text-muted-foreground hover:text-primary transition-colors py-2 text-lg font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="py-24 md:py-32 text-center bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-medium mb-4">
            <Camera className="w-4 h-4" />
            Built for tradies, cafes & small biz
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Finally, business cards that<br /><span className="text-accent">sort themselves.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stop typing contacts manually. Snap a card, save it. <span className="text-accent font-semibold">Done. No dramas.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              variant="default"
              size="xl"
              className="hover:bg-accent hover:text-accent-foreground"
              render={<Link href="#download" />}
            >
              Get it free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-2 border-foreground hover:border-accent hover:text-accent"
              render={<Link href="#how-it-works" />}
            >
              Watch it work
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-primary/10 rounded-2xl p-8">
              <div className="text-accent font-semibold mb-4">CardSnap in action</div>
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
      <section className="py-24 md:py-32 bg-muted/50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Sorted in Seconds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Point', desc: 'Point at any card. No setup, no account.' },
              { step: '2', title: 'Snap', desc: 'Tap once. OCR extracts everything instantly.' },
              { step: '3', title: 'Review', desc: 'Quick check. Fix if needed, takes seconds.' },
              { step: '4', title: 'Sorted', desc: 'Saved to contacts. Done. Next card!' },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-200">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32 bg-background" id="features">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ScanLine, title: 'Contacts sorted in seconds', desc: 'Point, tap, done. Google ML Kit does the rest.' },
              { icon: Check, title: 'Saved automatically', desc: 'Optionally auto-save after each scan. No taps wasted.' },
              { icon: Share2, title: 'Share anywhere', desc: 'Export as vCard or CSV. Send via any app.' },
              { icon: Globe, title: 'Works in any language', desc: 'English, Chinese, German, French. Sorted.' },
              { icon: Lock, title: 'Your data stays put', desc: 'All on your phone. No servers, no dramas.' },
              { icon: Smartphone, title: 'Built for Android', desc: 'Native app. CameraX + Compose. Works flawless.' },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-sm transition-all duration-200 group">
                  <div className="w-12 h-12 bg-accent/10 text-accent rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-muted/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">What They Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { quote: 'Finally! No more typing business cards manually. Sorted in seconds.', author: 'Mick O&apos;Brien, Syd Plumbing Bros' },
              { quote: 'I was skeptical, but CardSnap actually works. No dramas.', author: 'Sarah Chen, Café Oasis' },
              { quote: 'Scan, save, done. Just like it should be.', author: 'Dave Wilson, Precision Electric' },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-card border border-border rounded-xl p-6 hover:shadow-sm transition-all duration-200">
                <div className="text-accent mb-3 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-foreground mb-4 leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="text-muted-foreground text-sm font-medium">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section className="py-24 md:py-32 bg-muted/50" id="download">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Sorted. Get it free.</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Scan cards in seconds. Free forever. No account needed, no dramas.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="accent"
              size="xl"
              render={<Link href="https://github.com/crewcircle/CardSnap/releases" target="_blank" />}
            >
              <Smartphone className="w-5 h-5" />
              Get it free
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-2 border-foreground hover:border-accent hover:text-accent"
              render={<Link href="https://github.com/crewcircle/CardSnap" target="_blank" />}
            >
              <Code2 className="w-5 h-5" />
              View Source
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Requires Android 8.0 (API 26) or higher</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-muted-foreground text-sm">&copy; 2024 CardSnap. Built by <Link href="/" className="text-accent hover:text-accent/80 transition-colors">CrewCircle</Link>.</p>
          </div>
          <div className="flex gap-6">
            <Link href="https://github.com/crewcircle/CardSnap" className="text-muted-foreground hover:text-accent transition-colors text-sm" target="_blank">GitHub</Link>
            <Link href="/cardsnap/privacy-policy" className="text-muted-foreground hover:text-accent transition-colors text-sm">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
