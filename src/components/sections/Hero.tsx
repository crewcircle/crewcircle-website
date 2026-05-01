import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-white px-6 py-20">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />

      <div className="relative text-center max-w-4xl mx-auto">
        <div className="mb-6">
          <span className="text-5xl md:text-6xl font-black text-gray-900">Crew<span className="text-orange-500">Circle</span></span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
          Software that sorts your small biz —{' '}
          <span className="text-orange-500">no dramas.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          We build tools for Aussie cafés, tradies, shops & healthcare teams.
          <br />
          From rostering to bookkeeping — all sorted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="#apps"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg text-base font-semibold hover:bg-orange-600 transition-colors"
          >
            Explore Our Apps
            <span className="ml-2">↓</span>
          </Link>
          <Link
            href="/demo"
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg text-base font-semibold hover:border-orange-500 hover:text-orange-600 transition-colors"
          >
            Try Crew Roster Demo
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {['Cafés', 'Tradies', 'Healthcare', 'Retail'].map((industry) => (
            <span
              key={industry}
              className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium"
            >
              {industry}
            </span>
          ))}
        </div>

        <div className="mt-6 text-sm text-gray-400">
          Built for Aussies 🇦🇺
        </div>
      </div>
    </section>
  );
}
