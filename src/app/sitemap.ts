import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://votesaathi.vercel.app';
  
  return [
    {
      url: baseUrl,
      lastModified: '2026-05-02',
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
