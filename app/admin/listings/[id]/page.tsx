import { requireSession } from '@/lib/auth/session'
import { getAdminListingById, getAllCategories, getAllCommunes } from '@/lib/db/queries'
import type { ListingCategory, Commune } from '@/lib/types'
import { ListingForm } from '@/components/admin/ListingForm'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: PageProps) {
  await requireSession()
  const { id } = await params

  let listing: Awaited<ReturnType<typeof getAdminListingById>> = null
  let categories: ListingCategory[] = []
  let communes: Commune[] = []

  try {
    ;[listing, categories, communes] = await Promise.all([
      getAdminListingById(id),
      getAllCategories(),
      getAllCommunes(),
    ])
  } catch { /* DB */ }

  if (!listing) notFound()

  return (
    <div>
      <ListingForm listing={listing} categories={categories} communes={communes} />
    </div>
  )
}
