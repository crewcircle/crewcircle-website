import Hero from '@/components/sections/Hero';
import AppsGrid from '@/components/sections/AppsGrid';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <AppsGrid />
    </div>
  );
}
