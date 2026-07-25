import Link from 'next/link';
import { Calendar, ExternalLink, Mail, Phone } from 'lucide-react';
import { FOUNDER } from '@/lib/config/founder';
import { SOCIAL_ICONS } from '@/lib/config/social';
import ContactForm from '@/components/ContactForm';
import { Button } from '@/components/ui/button';

export default function ContactSection() {
  return (
    <section id="contact" className="py-24 md:py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            Get started
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Let&apos;s talk
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Got a problem AI could solve? Not sure where to start?{' '}
            <span className="text-foreground font-medium">
              Give me a yarn
            </span>{' '}
            I&apos;ll help you figure it out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Calendar booking */}
          <div>
            <div className="rounded-xl border border-border bg-muted/30 p-6 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Quick chat
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Skip the form and book a 30-minute call directly. No sales
                pitch, just a conversation about what you&apos;re trying to
                solve.
              </p>
              <Button
                variant="accent"
                size="default"
                className="w-full"
                render={<Link href={FOUNDER.calendly} target="_blank" rel="noopener noreferrer" />}
              >
                <Calendar className="w-4 h-4" />
                Book a 30-min call
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>

              <div className="mt-6 pt-6 border-t border-border space-y-2.5 text-sm">
                <a
                  href="mailto:prabhat@crewcircle.com.au"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <Mail className="w-4 h-4" />
                  prabhat@crewcircle.com.au
                </a>
                <details className="group">
                  <summary className="cursor-pointer list-none flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
                    <Phone className="w-4 h-4" />
                    <span>Mobile</span>
                    <span className="text-xs underline text-accent">(click to show)</span>
                  </summary>
                  <a
                    href="tel:+61410603242"
                    className="flex items-center gap-2 mt-2 text-foreground hover:text-foreground transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4" />
                    0410 603 242
                  </a>
                </details>
                <p className="text-muted-foreground pt-1">
                  ABN 86 699 000 5064
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">
                  Follow crew circle
                </h4>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Get the latest updates, insights, and behind-the-scenes content from our crew circle journey.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_ICONS.map(({ href, icon, label }) => (
                    <Button
                      key={label}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground hover:bg-accent/10"
                      aria-label={label}
                      render={<Link href={href} target="_blank" rel="noopener noreferrer" />}
                    >
                      {icon('w-5 h-5')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
