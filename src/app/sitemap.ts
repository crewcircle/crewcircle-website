import type { MetadataRoute } from 'next';
import { LOCATIONS } from '@/lib/config/locations';

const BASE = 'https://crewcircle.com.au';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: new Date(), priority: 1, changeFrequency: 'monthly' },
    { url: `${BASE}/solutions`, lastModified: new Date(), priority: 0.9, changeFrequency: 'monthly' },
    { url: `${BASE}/locations`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/pricing`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/blog`, lastModified: new Date(), priority: 0.6, changeFrequency: 'weekly' },
    { url: `${BASE}/cardsnap`, lastModified: new Date(), priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE}/terms`, lastModified: new Date(), priority: 0.2, changeFrequency: 'yearly' },
  ];

  const locationRoutes: MetadataRoute.Sitemap = LOCATIONS.map((l) => ({
    url: `${BASE}/locations/${l.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = [
    '5-time-saving-roster-tips',
    'gst-made-simple',
    'choose-workforce-software',
  ].map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...locationRoutes, ...blogRoutes];
}
