import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/washer/', '/admin/', '/api/', '/auth/', '/apply/onboarding'],
      },
    ],
    sitemap: 'https://driveo.ca/sitemap.xml',
  };
}
