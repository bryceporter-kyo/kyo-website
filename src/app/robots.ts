import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/internal/'],
      },
    ],
    sitemap: 'https://kyo.ca/sitemap.xml',
  };
}
