import Link from 'next/link';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-background px-6 py-20 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1504615235135-1e2b3e1?w=1920&q=80"
          alt="Australian tradie on job site"
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      <div className="absolute inset-0 bg-background/85" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

      <div className="relative text-center max-w-4xl mx-auto">
        <div className="mb-6 flex justify-center">
          <Image
            src="/crewcircle-logo.svg"
            alt="CrewCircle Logo"
            width={200}
            height={200}
            className="w-auto h-12 md:h-16"
          />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
          Sorted.
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Tools for your crew.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#apps"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-md text-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Get it
            </Link>
            <Link
              href="/demo"
              className="px-8 py-3 border-2 border-foreground text-foreground rounded-md text-lg font-bold hover:border-primary hover:text-primary transition-colors"
            >
              Try it
            </Link>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          Tradies. That's it.
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
            {['Tradies', 'Cafés', 'Shops', 'Healthcare'].map((industry) => (
              <span
                key={industry}
                className="px-4 py-1.5 bg-muted text-muted-foreground rounded-full text-sm font-medium"
              >
                {industry}
              </span>
            ))}
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          Built for your crew 🇦🇺
        </div>
      </div>
    </section>
  );
}
