// ─────────────────────────────────────────────
// Zanimo Guide — Shared Types
// ─────────────────────────────────────────────

// ── Enums ────────────────────────────────────

export type ListingType = 'place' | 'spot' | 'walk' | 'service'

export type DogPolicyStatus = 'allowed' | 'conditional' | 'disallowed' | 'unknown'

export type TrustLevel = 'high' | 'medium' | 'low'

export type VerificationStatus = 'published' | 'draft' | 'pending_review' | 'needs_recheck' | 'conflict' | 'archived'

export type ContributionType = 'new_listing' | 'correction' | 'report'
export type ContributionStatus = 'pending' | 'approved' | 'rejected' | 'merged'

export type CampaignType = 'featured_listing' | 'inline_banner' | 'category_sponsor' | 'seasonal'

export type UserRole = 'superadmin' | 'moderator' | 'content_manager' | 'sponsor_manager' | 'pro' | 'user'

export type ReactionType = 'useful' | 'thanks' | 'love' | 'oops'

export type TrailDifficulty = 'easy' | 'moderate' | 'hard' | 'expert'

// ── Core entities ────────────────────────────

export interface Commune {
  id: string
  slug: string
  name: string
  lat?: number
  lng?: number
}

export interface ListingCategory {
  id: string
  slug: string
  label: string
  icon: string
  listing_type: ListingType
  sort_order: number
}

export interface ListingPhoto {
  id: string
  listing_id: string
  url: string
  alt: string | null
  is_cover: boolean
  sort_order: number
}

export interface ListingAmenity {
  id: string
  slug: string
  label: string
  icon: string
  type: string
}

export interface ListingHours {
  id: string
  listing_id: string
  day: number // 0=Mon, 6=Sun
  open_time: string
  close_time: string
}

export interface ListingContact {
  id: string
  listing_id: string
  type: 'phone' | 'email' | 'website' | 'facebook' | 'instagram' | 'maps'
  value: string
  label: string | null
}

export interface Verification {
  id: string
  listing_id: string
  verified_at: string
  method: string | null
  notes: string | null
  user_id: string | null
}

export interface SourceEvidence {
  id: string
  listing_id: string
  source_type: 'official' | 'field' | 'social' | 'press' | 'osm' | 'google' | 'other'
  source_url: string | null
  excerpt: string | null
  captured_at: string
}

export interface TrailDetails {
  difficulty: TrailDifficulty
  distance_km: number | null
  elevation_m: number | null
  duration_minutes: number | null
  terrain_type: 'forest' | 'coastal' | 'mountain' | 'mixed' | null
  leash_required: boolean
  has_water_points: boolean
  water_points_desc: string | null
  regulated_zones: string | null
  start_lat: number | null
  start_lng: number | null
}

export interface Listing {
  id: string
  type: ListingType
  slug: string
  title: string
  short_description: string | null
  long_description: string | null
  commune: Commune | null
  commune_id: string | null
  address: string | null
  lat: number | null
  lng: number | null
  dog_policy_status: DogPolicyStatus
  dog_policy_rules: string | null
  trust_level: TrustLevel
  verified_at: string | null
  verification_status: VerificationStatus
  is_published: boolean
  is_featured: boolean
  is_sponsored: boolean
  campaign_id: string | null
  contact_phone: string | null
  contact_email: string | null
  website_url: string | null
  social_urls: Record<string, string> | null
  trail_details: TrailDetails | null
  category: ListingCategory | null
  photos: ListingPhoto[]
  amenities: ListingAmenity[]
  cover_url: string | null
  source_count: number
  created_at: string
  updated_at: string
}

// ── Search ────────────────────────────────────

export interface SearchParams {
  q?: string
  type?: ListingType
  commune_slug?: string
  dog_policy?: DogPolicyStatus
  difficulty?: TrailDifficulty
  category_slug?: string
  lat?: number
  lng?: number
  radius_km?: number
  page?: number
  per_page?: number
  sort?: 'relevance' | 'distance' | 'updated'
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  per_page: number
}

// ── Reactions ────────────────────────────────

export type ReactionCounts = Record<ReactionType, number>

// ── Campaigns / Sponsor ───────────────────────

export interface Campaign {
  id: string
  slug: string
  title: string
  advertiser: string | null
  type: CampaignType
  target: {
    listing_type?: ListingType
    commune_slug?: string
    category_slug?: string
  } | null
  asset_url: string | null
  cta_url: string | null
  cta_label: string | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
}

export interface AdSlot {
  id: string
  slot_key: string
  label: string
  is_active: boolean
  campaign_id: string | null
  campaign: Campaign | null
}

// ── Contributions ────────────────────────────

export interface Contribution {
  id: string
  listing_id: string | null
  type: ContributionType
  data: Record<string, unknown>
  status: ContributionStatus
  submitter_anon: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

// ── Pro profiles ──────────────────────────────

export interface ProProfile {
  id: string
  user_id: string
  business_name: string
  type: string
  contact: Record<string, string> | null
  is_verified: boolean
  created_at: string
}

// ── Admin / Auth ──────────────────────────────

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: UserRole
  created_at: string
}
