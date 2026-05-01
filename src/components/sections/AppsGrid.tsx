import { APPS } from '@/lib/constants';
import AppCard from '@/components/ui/AppCard';

export default function AppsGrid() {
  return (
    <section id="apps" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Apps</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four tools, one mission — sorting your business so you can focus on what
            matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {APPS.map((app, index) => (
            <AppCard key={app.slug} app={app} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
