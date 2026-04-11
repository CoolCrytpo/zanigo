// Sync no-op — le tsvector est mis à jour automatiquement via trigger SQL
// (listings_search_vector_trigger dans migration 007)
export async function syncListingToSearch(_listingId: string): Promise<void> {
  // rien à faire — trigger automatique
}

export async function removeListingFromSearch(_id: string): Promise<void> {
  // rien à faire — suppression en cascade
}

export async function syncAllListings(): Promise<void> {
  // rien à faire — trigger automatique
}

export async function configureSearchIndex(): Promise<void> {
  // rien à faire
}
