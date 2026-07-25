import { TESTIMONIALS } from '@/lib/config/testimonials';

export default function Testimonials() {
  return (
    <section id="proof" className="py-24 md:py-32 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            Loved by small business
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why owners trust CrewCircle
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Real tools, real outcomes for Aussie tradies, cafés, clinics and shops.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-border bg-background p-6 flex flex-col"
            >
              <p className="text-foreground/90 leading-relaxed flex-1">{t.quote}</p>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t.role}, {t.business}
                </p>
                <span className="inline-block mt-2 text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                  {t.segment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
