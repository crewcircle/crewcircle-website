import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-amber-50 to-white px-6 py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

      <div className="relative text-center max-w-4xl mx-auto">
        {/* Logo placeholder */}
        <div className="mb-8">
          <span className="text-6xl font-black text-orange-500">CrewCircle</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
          Software that sorts your small biz —{' '}
          <span className="text-orange-500">no dramas.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
          We build tools for Aussie cafés, tradies, shops & healthcare teams.
          <br />
          From rostering to bookkeeping — all sorted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="#apps"
            className="px-8 py-4 bg-orange-500 text-white rounded-xl text-lg font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl"
          >
            Explore Our Apps ↓
          </Link>
          <Link
            href="/demo"
            className="px-8 py-4 border-2 border-orange-500 text-orange-600 rounded-xl text-lg font-bold hover:bg-orange-50 transition-all"
          >
            Try Crew Roster Demo
          </Link>
        </div>

        {/* Aussie badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">🇦🇺 Built for Aussies</span>
          <span className="flex items-center gap-1">☕ Cafés</span>
          <span className="flex items-center gap-1">🔧 Tradies</span>
          <span className="flex items-center gap-1">🏥 Healthcare</span>
          <span className="flex items-center gap-1">🛍️ Retail</span>
        </div>
      </div>
    </section>
  );
}
