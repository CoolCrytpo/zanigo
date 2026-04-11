import { requireSession } from '@/lib/auth/session'
import { getAllCategories, getAllCommunes } from '@/lib/db/queries'
import type { ListingCategory, Commune } from '@/lib/types'
import { ListingForm } from '@/components/admin/ListingForm'

export default async function NewListingPage() {
  await requireSession()

  let categories: ListingCategory[] = []
  let communes: Commune[] = []

  try {
    ;[categories, communes] = await Promise.all([
      getAllCategories(),
      getAllCommunes(),
    ])
  } catch { /* DB */ }

  return (
    <div>
      <ListingForm listing={null} categories={categories} communes={communes} />
    </div>
  )
}
