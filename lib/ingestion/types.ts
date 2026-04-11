// ─────────────────────────────────────────────
// ZaniGo — Ingestion module types
// ─────────────────────────────────────────────

export type BatchStatus =
  | 'pending_analysis' | 'analyzed' | 'imported_to_staging'
  | 'partially_failed' | 'failed' | 'completed'

export type SourceStatus =
  | 'compatible' | 'partially_compatible' | 'fallback_used'
  | 'not_supported' | 'blocked' | 'pending' | 'error'

export type PageType = 'list' | 'detail' | 'editorial' | 'unknown' | 'error'

export type Compatibility = 'excellent' | 'good' | 'medium' | 'low' | 'failed'

export type StagingStatus =
  | 'raw_import' | 'to_review' | 'duplicate_suspected'
  | 'approved' | 'rejected' | 'merged' | 'published'

export type DogPolicyRaw = 'yes' | 'no' | 'conditional' | 'unknown'

export interface ExtractedItem {
  name: string
  category?: string
  subcategory?: string
  commune_name?: string
  address?: string
  postal_code?: string
  lat?: number
  lng?: number
  phone?: string
  email?: string
  website?: string
  dog_policy: DogPolicyRaw
  dog_policy_detail?: string
  inside_allowed?: string
  terrace_only?: string
  leash_required?: string
  extra_fee?: string
  proof_excerpt?: string
  confidence_score: number
  source_url: string
  source_domain: string
  source_page_type: PageType
  external_id?: string
}

export interface AnalysisResult {
  url: string
  domain: string
  page_type: PageType
  extractor_used: string
  compatibility: Compatibility
  items_found: number
  items: ExtractedItem[]
  status: SourceStatus
  error_message?: string
  raw_excerpt?: string
}

export interface StagingListing {
  id: string
  batch_id: string | null
  source_id: string | null
  name: string
  category: string | null
  subcategory: string | null
  commune_name: string | null
  address: string | null
  postal_code: string | null
  lat: number | null
  lng: number | null
  phone: string | null
  email: string | null
  website: string | null
  dog_policy: DogPolicyRaw
  dog_policy_detail: string | null
  dog_size_rule: string | null
  inside_allowed: string
  terrace_only: string
  leash_required: string
  extra_fee: string
  proof_excerpt: string | null
  confidence_score: number
  source_url: string | null
  source_domain: string | null
  source_type_label: string | null
  source_page_type: string | null
  external_id: string | null
  dedupe_key: string | null
  duplicate_of_listing_id: string | null
  duplicate_score: number
  status: StagingStatus
  rejection_reason: string | null
  admin_notes: string | null
  published_listing_id: string | null
  created_at: string
  updated_at: string
}

export interface ImportBatch {
  id: string
  created_by: string | null
  source_type: 'url' | 'csv' | 'manual'
  status: BatchStatus
  label: string | null
  total_sources: number
  total_extracted: number
  total_imported: number
  total_rejected: number
  total_duplicates: number
  error_log: unknown[]
  created_at: string
  updated_at: string
}

export interface ListingRequest {
  id: string
  listing_id: string | null
  listing_slug: string | null
  request_type: 'correction' | 'removal' | 'objection' | 'other'
  requester_name: string
  requester_email: string
  requester_role: string | null
  request_reason: string | null
  request_message: string
  proof_url: string | null
  status: 'new' | 'under_review' | 'need_more_info' | 'accepted' | 'rejected' | 'applied' | 'closed'
  admin_response: string | null
  handled_by: string | null
  received_at: string
  updated_at: string
  resolved_at: string | null
}

// CSV pivot columns
export const CSV_COLUMNS = [
  'external_id','source_type','source_page_type','name','category','subcategory',
  'commune','address','postal_code','lat','lng','phone','email','website',
  'dog_policy','dog_policy_detail','dog_size_rule','inside_allowed','terrace_only',
  'leash_required','extra_fee','proof_excerpt','confidence_score','status',
  'admin_notes','source_url','source_domain','import_batch_id','dedupe_key',
] as const
