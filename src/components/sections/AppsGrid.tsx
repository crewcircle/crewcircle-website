import { APPS } from '@/lib/constants';
import AppCard from '@/components/ui/AppCard';

export default function AppsGrid() {
  return (
    <section id="apps" className="py-16 md:py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Our Apps
          </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Four tools, one mission: sorting your business so you can focus on what
              matters.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {APPS.map((app, index) => (
            <AppCard key={app.slug} app={app} index={index} />
          ))}
        </div>

        <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              More apps coming soon. Sign up to get notified
            </p>
        </div>
      </div>
    </section>
  );
}
