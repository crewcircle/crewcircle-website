import dynamic from 'next/dynamic';
import Hero from '@/components/sections/Hero';
import ServicesSection from '@/components/sections/ServicesSection';
import AboutSection from '@/components/sections/AboutSection';
import ContactSection from '@/components/sections/ContactSection';

const AppsGrid = dynamic(() => import('@/components/sections/AppsGrid'), {
  loading: () => (
    <div className="py-16 md:py-24 px-6 bg-muted">
      <div className="max-w-7xl mx-auto text-center">
        <div className="h-8 w-32 bg-muted-foreground/20 rounded animate-pulse mx-auto mb-4" />
        <div className="h-4 w-64 bg-muted-foreground/20 rounded animate-pulse mx-auto" />
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <AppsGrid />
      <ServicesSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
