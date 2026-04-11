// ─────────────────────────────────────────────
// ZaniGo — Normalizer
// ─────────────────────────────────────────────
import type { ExtractedItem, DogPolicyRaw } from './types'

const COMMUNE_SLUGS: Record<string, string> = {
  'saint-denis': 'saint-denis', 'saint-paul': 'saint-paul',
  'saint-pierre': 'saint-pierre', 'le tampon': 'le-tampon',
  'saint-louis': 'saint-louis', 'saint-andré': 'saint-andre',
  'saint-benoit': 'saint-benoit', 'saint-benoît': 'saint-benoit',
  'saint-joseph': 'saint-joseph', 'sainte-marie': 'sainte-marie',
  'sainte-rose': 'sainte-rose', 'saint-leu': 'saint-leu',
  'cilaos': 'cilaos', 'entre-deux': 'entre-deux',
  "l'étang-salé": 'letang-sale', 'letang-sale': 'letang-sale',
  'petite-île': 'petite-ile', 'petite-ile': 'petite-ile',
  'les avirons': 'les-avirons', 'saint-philippe': 'saint-philippe',
  'sainte-suzanne': 'sainte-suzanne', 'bras-panon': 'bras-panon',
  'la plaine-des-palmistes': 'la-plaine-des-palmistes',
  'la possession': 'la-possession', 'le port': 'le-port',
  'trois-bassins': 'trois-bassins',
}

const CATEGORY_MAP: Record<string, string> = {
  'restaurant': 'restaurant', 'resto': 'restaurant', 'brasserie': 'restaurant',
  'cafe': 'cafe', 'café': 'cafe', 'snack': 'cafe', 'salon de thé': 'cafe',
  'bar': 'bar', 'pub': 'bar',
  'hôtel': 'lodging', 'hotel': 'lodging', 'gîte': 'lodging', 'gite': 'lodging',
  'chambre d\'hôtes': 'lodging', 'location': 'lodging', 'hébergement': 'lodging',
  'plage': 'beach', 'beach': 'beach',
  'parc': 'park', 'jardin': 'park', 'espace vert': 'park',
  'balade': 'hiking', 'randonnée': 'hiking', 'sentier': 'hiking', 'trail': 'hiking',
  'activité': 'activity', 'loisir': 'activity', 'sport': 'activity',
  'vétérinaire': 'veterinary', 'clinique vétérinaire': 'veterinary',
  'toilettage': 'grooming', 'toiletteur': 'grooming',
  'animalerie': 'shop', 'pet store': 'shop',
  'boulangerie': 'bakery', 'pâtisserie': 'bakery',
  'épicerie': 'shop', 'commerce': 'shop',
}

export function normalizeCommune(name: string): string {
  if (!name) return ''
  return COMMUNE_SLUGS[name.toLowerCase().trim()] ?? ''
}

export function normalizeCategory(label: string): string {
  if (!label) return 'unknown'
  const lower = label.toLowerCase().trim()
  for (const [key, val] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(key)) return val
  }
  return 'unknown'
}

export function normalizePhone(raw: string): string {
  if (!raw) return ''
  const digits = raw.replace(/[^+\d]/g, '')
  if (digits.startsWith('+262')) return digits
  if (digits.startsWith('0262') || digits.startsWith('0692') || digits.startsWith('0693')) {
    return '+262' + digits.slice(1)
  }
  return raw.trim()
}

export function normalizeDogPolicy(raw: string): DogPolicyRaw {
  const v = raw?.toLowerCase().trim()
  if (['yes', 'oui', 'allowed', 'true', '1'].includes(v)) return 'yes'
  if (['no', 'non', 'disallowed', 'false', '0', 'interdit'].includes(v)) return 'no'
  if (['conditional', 'conditionnel', 'sous conditions', 'conditionally'].includes(v)) return 'conditional'
  return 'unknown'
}

export function normalizeItem(item: ExtractedItem): ExtractedItem {
  return {
    ...item,
    name: item.name.trim(),
    commune_name: item.commune_name?.trim(),
    phone: item.phone ? normalizePhone(item.phone) : undefined,
    email: item.email?.toLowerCase().trim(),
    website: item.website?.trim(),
    category: item.category ? normalizeCategory(item.category) : undefined,
    dog_policy: normalizeDogPolicy(item.dog_policy as string),
    proof_excerpt: item.proof_excerpt?.slice(0, 300),
  }
}

export function buildDedupeKey(name: string, commune: string): string {
  const normalName = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .trim()
  const normalCommune = commune.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '')
    .trim()
  return `${normalName}|${normalCommune}`
}
