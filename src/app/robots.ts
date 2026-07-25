import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://crewcircle.com.au/sitemap.xml',
    host: 'https://crewcircle.com.au',
  };
}
