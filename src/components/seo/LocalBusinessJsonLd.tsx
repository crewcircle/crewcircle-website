import { BUSINESS } from '@/lib/config/business';

export default function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS.name,
    url: BUSINESS.url,
    image: BUSINESS.logo,
    description: BUSINESS.description,
    areaServed: { '@type': 'Country', name: BUSINESS.areaServed },
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.address.addressLocality,
      addressRegion: BUSINESS.address.addressRegion,
      addressCountry: BUSINESS.address.addressCountry,
    },
    founder: {
      '@type': 'Person',
      name: BUSINESS.founder.name,
      sameAs: BUSINESS.founder.sameAs,
    },
    sameAs: BUSINESS.sameAs,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
      }}
    />
  );
}
