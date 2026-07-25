import { SERVICES } from '@/lib/config/services';
import { Lightbulb, Wrench, BarChart3, Headphones } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Lightbulb: <Lightbulb className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
  BarChart3: <BarChart3 className="w-6 h-6" />,
  HeadphonesIcon: <Headphones className="w-6 h-6" />,
};

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 md:py-32 px-6 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-accent mb-3 block">
            How we help
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What we do
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="bg-card border border-border rounded-xl p-5 md:p-6 hover:shadow-md hover:border-accent/20 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-200">
                {iconMap[service.icon]}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {service.description}
              </p>
              <ul className="space-y-1.5">
                {service.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
