import type { MetadataRoute } from 'next'
import { APP_URL } from '@/config/constants'

const LISTING_TYPE_PATHS: Record<string, string> = {
  place:   'lieux',
  spot:    'spots',
  walk:    'balades',
  service: 'services',
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${APP_URL}/explorer`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/lieux`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/spots`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/balades`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/a-la-une`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${APP_URL}/pro`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/contribuer`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/methodologie`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  try {
    const { default: pool } = await import('@/lib/db/client')
    const result = await pool.query<{ slug: string; type: string; updated_at: string }>(
      `SELECT slug, type, updated_at
       FROM listings
       WHERE is_published = true
       ORDER BY updated_at DESC
       LIMIT 10000`
    )
    const listingPages: MetadataRoute.Sitemap = result.rows.map((row) => ({
      url: `${APP_URL}/${LISTING_TYPE_PATHS[row.type] ?? 'lieux'}/${row.slug}`,
      lastModified: new Date(row.updated_at),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
    return [...staticPages, ...listingPages]
  } catch {
    return staticPages
  }
}
