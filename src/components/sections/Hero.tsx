import Link from 'next/link';
import Image from 'next/image';
import { HERO_CONTENT, TRUST_METRICS } from '@/lib/config/site';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.03] via-background to-primary/[0.03]" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      <div className="relative w-full max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/5 border border-accent/15 text-sm text-accent font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              AI that sorts the boring stuff for small business
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground mb-6 leading-[1.1] tracking-tight">
              Software that actually sorts{' '}
              <span className="text-accent">your small biz.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
              {HERO_CONTENT.subheadline}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="accent"
                size="xl"
                className="hover:shadow-lg hover:shadow-accent/20"
                render={<Link href="/#contact" />}
              >
                {HERO_CONTENT.cta}
                <ArrowRight className="w-4 h-4 group-hover/button:translate-x-0.5 transition-transform" />
              </Button>
              <Link
                href="/#apps"
                className="group inline-flex items-center justify-center gap-2 px-7 py-4 border border-border text-foreground font-semibold rounded-xl hover:bg-muted hover:border-border/80 transition-all duration-300 text-base"
              >
                {HERO_CONTENT.secondaryCta}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-accent/20 via-accent/5 to-transparent blur-sm" />
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10" />

              <div className="relative w-80 h-96 rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-accent/10">
                <Image
                  src="/hero-small-biz.jpg"
                  alt="Small business owner"
                  width={400}
                  height={500}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>

              <div className="absolute -bottom-4 -left-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-background/95 backdrop-blur-md border border-border shadow-lg">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Real human</p>
                  <p className="text-[10px] text-muted-foreground">No sales team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
