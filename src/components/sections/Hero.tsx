import Link from 'next/link';

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
        <div className="mb-6">
          <span className="text-5xl md:text-6xl font-black text-foreground">Crew<span className="text-primary">Circle</span></span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
          Tools that sort your biz:{' '}
          <span className="text-primary">no dramas.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          High-viz tools for tradies, cafés, and shops across Australia.
          <br />
          From the ute to the job site: sorted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#apps"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-base font-semibold hover:bg-primary/90 transition-colors"
            >
              Grab the Tools
              <span className="ml-2">↓</span>
            </Link>
            <Link
              href="/demo"
              className="px-6 py-3 border-2 border-input text-foreground rounded-lg text-base font-semibold hover:border-primary hover:text-primary transition-colors"
            >
              Try it on the Job
            </Link>
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
          Built for Aussies 🇦🇺
        </div>
      </div>
    </section>
  );
}
