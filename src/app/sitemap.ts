import { MetadataRoute } from 'next';
import { fetchPublishedGrantsServer } from '@/lib/case-for-support-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://kyo.ca';

  const staticPages: { path: string; priority: number; changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/team', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/staff', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/programs/orchestras', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/programs/upbeat', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/programs/lessons', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/programs/calendar', priority: 0.9, changeFrequency: 'daily' },
    { path: '/programs/registration/orchestras', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/programs/registration/upbeat', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/support-us/ways-to-give', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/support-us/donate', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/support-us/volunteer', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/support-us/case-for-support', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/legal', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/legal/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/terms-of-use', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/accessibility-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/hiring-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/information-accuracy-policy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/legal/protection-of-children-and-vulnerable-persons-policy', priority: 0.3, changeFrequency: 'yearly' },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  try {
    const grants = await fetchPublishedGrantsServer();
    const grantEntries: MetadataRoute.Sitemap = grants.map((g) => {
      const uid = g.id ? g.id.substring(0, 6) : 'grant';
      const funderSlug = (g.funderName || 'funder')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const year = g.grantCycleYear || new Date().getFullYear().toString();

      return {
        url: `${baseUrl}/support-us/case-for-support/${uid}/${funderSlug}/${year}`,
        lastModified: g.submissionDate ? new Date(g.submissionDate) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });

    return [...staticEntries, ...grantEntries];
  } catch (err) {
    console.error('[Sitemap] Error fetching grants for sitemap:', err);
    return staticEntries;
  }
}
