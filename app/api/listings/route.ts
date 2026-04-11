import { NextRequest, NextResponse } from 'next/server'
import { getPublishedListings, getAllCommunes } from '@/lib/db/queries'
import type { DogPolicyStatus, ListingType } from '@/lib/types'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const page = Math.max(1, parseInt(sp.get('page') ?? '1'))

  try {
    const [result, communes] = await Promise.all([
      getPublishedListings({
        q:             sp.get('q') ?? undefined,
        listing_type:  (sp.get('type') || undefined) as ListingType | undefined,
        commune_slug:  sp.get('commune_slug') ?? undefined,
        dog_policy:    (sp.get('dog_policy') || undefined) as DogPolicyStatus | undefined,
        category_slug: sp.get('category') ?? undefined,
        page,
        per_page: 24,
      }),
      getAllCommunes(),
    ])
    return NextResponse.json({ ...result, communes })
  } catch {
    return NextResponse.json({ items: [], total: 0, page: 1, per_page: 24, communes: [] })
  }
}
