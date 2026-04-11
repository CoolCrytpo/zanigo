// ─────────────────────────────────────────────
// ZaniGo — URL extractor (server-side, no external deps)
// ─────────────────────────────────────────────

import type { AnalysisResult, ExtractedItem, Compatibility, PageType, SourceStatus, DogPolicyRaw } from './types'

const TIMEOUT_MS = 12_000
const MAX_CHILD_PAGES = 15

// ── Keyword banks ─────────────────────────────

const POSITIVE_KW = [
  'animaux acceptés', 'animaux admis', 'animaux bienvenus', 'animaux autorisés',
  'chiens acceptés', 'chiens admis', 'chiens bienvenus', 'chiens autorisés',
  'accompagné de votre animal', 'nos amis les bêtes',
  'pet friendly', 'pets allowed', 'dog friendly', 'dogs allowed', 'dogs welcome',
]
const CONDITIONAL_KW = [
  'sous conditions', 'petits animaux', 'chiens de moins', 'petit chien',
  'laisse obligatoire', 'terrasse uniquement', 'terrasse seulement',
  'supplément', 'supplement', 'animaux de petite taille',
  'dogs on leash', 'on leash only', 'en terrasse', 'pets on leash',
]
const NEGATIVE_KW = [
  'animaux non admis', 'animaux non autorisés', 'animaux interdits',
  'chiens interdits', 'chiens non acceptés', 'chiens non admis',
  'no pets', 'pets not allowed', 'dogs not allowed',
]

// ── HTML utilities ────────────────────────────

function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  )
}

function extractMeta(html: string, name: string): string {
  const m =
    html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i')) ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'))
  return m ? decodeEntities(m[1].trim()) : ''
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'og:title')
  if (og) return og
  const tw = extractMeta(html, 'twitter:title')
  if (tw) return tw
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1) return decodeEntities(h1[1].trim())
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (t) return decodeEntities(t[1].replace(/\s*[-|–—].*$/, '').trim())
  return ''
}

function extractDescription(html: string): string {
  const og = extractMeta(html, 'og:description')
  if (og) return og
  return extractMeta(html, 'description')
}

// ── Link extraction ────────────────────────────

function extractInternalLinks(html: string, baseUrl: string, baseDomain: string): string[] {
  const seen = new Set<string>()
  const links: string[] = []
  const re = /href=["']([^"'#?]+)/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      const abs = new URL(m[1], baseUrl).href
      const linkDomain = new URL(abs).hostname.replace(/^www\./, '')
      if (linkDomain === baseDomain && !seen.has(abs)) {
        seen.add(abs)
        links.push(abs)
      }
    } catch { /* skip */ }
  }
  return links
}

function extractExternalLinks(html: string, baseUrl: string, baseDomain: string): string[] {
  const seen = new Set<string>()
  const links: string[] = []
  const BLACKLIST = ['google', 'fonts', 'cdn', 'jquery', 'bootstrap', 'cloudflare', '.js', '.css',
    'facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'tripadvisor', 'booking', 'airbnb']
  const re = /href=["']([^"'#?]+)/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      const abs = new URL(m[1], baseUrl).href
      if (!abs.startsWith('http')) continue
      const linkDomain = new URL(abs).hostname.replace(/^www\./, '')
      if (linkDomain === baseDomain) continue
      if (BLACKLIST.some(b => abs.toLowerCase().includes(b))) continue
      if (!seen.has(abs)) { seen.add(abs); links.push(abs) }
    } catch { /* skip */ }
  }
  return links
}

// ── Dog policy detection ──────────────────────

function detectDogPolicy(text: string): { policy: DogPolicyRaw; excerpt: string; score: number } {
  const lower = text.toLowerCase()
  for (const kw of NEGATIVE_KW) {
    const idx = lower.indexOf(kw)
    if (idx !== -1) return { policy: 'no', excerpt: text.slice(Math.max(0, idx - 40), idx + kw.length + 80).trim(), score: 75 }
  }
  for (const kw of CONDITIONAL_KW) {
    const idx = lower.indexOf(kw)
    if (idx !== -1) return { policy: 'conditional', excerpt: text.slice(Math.max(0, idx - 40), idx + kw.length + 100).trim(), score: 70 }
  }
  for (const kw of POSITIVE_KW) {
    const idx = lower.indexOf(kw)
    if (idx !== -1) return { policy: 'yes', excerpt: text.slice(Math.max(0, idx - 40), idx + kw.length + 100).trim(), score: 80 }
  }
  return { policy: 'unknown', excerpt: '', score: 20 }
}

// ── Field extractors ──────────────────────────

function extractPhone(text: string): string {
  const m = text.match(
    /(?:\+262|0262|0692|0693)[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}[\s.\-]?\d{2}|\b0[1-9](?:[\s.\-]?\d{2}){4}\b/
  )
  return m ? m[0].replace(/[\s.\-]+/g, ' ').trim() : ''
}

function extractEmail(html: string): string {
  // Look in the raw HTML (before stripping) to catch mailto: links and obfuscated emails
  const mailto = html.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
  if (mailto) return mailto[1]
  const m = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return m ? m[0] : ''
}

function extractWebsite(html: string, baseDomain: string, sourceUrl: string): string {
  const links = extractExternalLinks(html, sourceUrl, baseDomain)
  // Prefer links that look like a homepage (short path)
  return links.find(l => {
    try {
      const u = new URL(l)
      return u.pathname.length < 20 && !l.includes('?')
    } catch { return false }
  }) ?? links[0] ?? ''
}

function extractCommune(text: string): string {
  const COMMUNES = [
    'Saint-Denis', 'Saint-Paul', 'Saint-Pierre', 'Le Tampon', 'Saint-Louis', 'Saint-André',
    'Saint-Benoît', 'Saint-Joseph', 'Sainte-Marie', 'Sainte-Rose', 'Saint-Leu', 'Cilaos',
    'Entre-Deux', "L'Étang-Salé", 'Petite-Île', 'Les Avirons', 'Saint-Philippe',
    'Sainte-Suzanne', 'Bras-Panon', 'La Plaine-des-Palmistes', 'La Possession',
    'Le Port', 'Trois-Bassins', 'Mafate', 'Salazie',
  ]
  for (const c of COMMUNES) {
    if (text.includes(c)) return c
  }
  return ''
}

function extractAddress(text: string): string {
  const m = text.match(/\d+[,\s]+(?:rue|allée|avenue|chemin|route|impasse|lieu-dit)\s+[^,\n.]{5,50}/i)
  return m ? m[0].trim() : ''
}

// ── Page type detection ───────────────────────

interface ListDetection {
  isList: boolean
  childLinks: string[]
}

function detectListPage(html: string, baseUrl: string, baseDomain: string): ListDetection {
  const internalLinks = extractInternalLinks(html, baseUrl, baseDomain)
  const basePath = (() => { try { return new URL(baseUrl).pathname } catch { return '/' } })()

  // Find links that are "children" of the current path
  const childLinks = internalLinks.filter(link => {
    try {
      const linkPath = new URL(link).pathname
      // Must be deeper in the hierarchy
      if (!linkPath.startsWith(basePath) || linkPath === basePath) return false
      // Avoid static assets and navigation
      const ext = linkPath.split('.').pop()?.toLowerCase()
      if (['jpg', 'png', 'pdf', 'css', 'js', 'svg', 'gif', 'webp'].includes(ext ?? '')) return false
      const avoidSegments = ['contact', 'about', 'nous', 'accueil', 'search', 'login', 'admin', 'tag', 'categorie']
      if (avoidSegments.some(s => linkPath.toLowerCase().includes(s))) return false
      return true
    } catch { return false }
  })

  // Also look for repeated card/article patterns
  const repeatPatterns = [
    /<article[^>]*>/gi, /<div[^>]+class="[^"]*(?:card|item|listing|fiche|gite|etablissement|hebergement|lodge|result)[^"]*"/gi,
    /<li[^>]+class="[^"]*(?:item|result|listing)[^"]*"/gi,
  ]
  const patternCount = repeatPatterns.reduce((acc, re) => acc + (html.match(re) ?? []).length, 0)

  const isList = childLinks.length >= 2 || patternCount >= 3

  return { isList, childLinks: childLinks.slice(0, MAX_CHILD_PAGES) }
}

// ── Compatibility ─────────────────────────────

function detectCompatibility(domain: string): Compatibility {
  const EXCELLENT = ['reunion.fr', 'irt.re', 'ouest-lareunion.com', 'sud.re', 'nordreunion.fr']
  const GOOD = ['tripadvisor.fr', 'tripadvisor.com', 'gites-de-france.com', 'bringfido.com']
  const LOW = ['facebook.com', 'instagram.com']
  if (EXCELLENT.some(d => domain.includes(d))) return 'excellent'
  if (GOOD.some(d => domain.includes(d))) return 'good'
  if (LOW.some(d => domain.includes(d))) return 'low'
  return 'medium'
}

// ── Fetch helper ──────────────────────────────

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZaniGoBot/1.0; +https://zanigo.re)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.5',
      },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('html')) return null
    return await res.text()
  } catch {
    return null
  }
}

// ── Single item extractor ─────────────────────

function extractItemFromPage(html: string, url: string, domain: string): ExtractedItem {
  const text = stripHtml(html)
  const name = extractTitle(html) || 'Lieu sans nom'
  const description = extractDescription(html)
  const { policy, excerpt, score } = detectDogPolicy(text)
  const commune = extractCommune(text)
  const phone = extractPhone(text)
  const email = extractEmail(html)
  const website = extractWebsite(html, domain, url)
  const address = extractAddress(text)

  let confidence = score
  if (commune) confidence += 5
  if (phone) confidence += 5
  if (email) confidence += 3
  if (address) confidence += 3
  if (excerpt) confidence += 5
  confidence = Math.min(confidence, 95)

  return {
    name,
    commune_name: commune || undefined,
    address: address || undefined,
    phone: phone || undefined,
    email: email || undefined,
    website: website || undefined,
    dog_policy: policy,
    dog_policy_detail: description || undefined,
    proof_excerpt: excerpt || undefined,
    confidence_score: confidence,
    source_url: url,
    source_domain: domain,
    source_page_type: 'detail',
  }
}

// ── Main analyze function ─────────────────────

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  let domain = ''
  try {
    domain = new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return {
      url, domain: '', page_type: 'error', extractor_used: 'none',
      compatibility: 'failed', items_found: 0, items: [],
      status: 'error', error_message: 'URL invalide',
    }
  }

  const compatibility = detectCompatibility(domain)

  const html = await fetchPage(url)
  if (!html) {
    return {
      url, domain, page_type: 'error', extractor_used: 'fetch',
      compatibility: 'failed', items_found: 0, items: [],
      status: 'error', error_message: 'Page inaccessible ou timeout',
    }
  }

  const text = stripHtml(html)
  const rawExcerpt = text.slice(0, 400)

  // Detect if editorial (no listing data)
  const lower = text.toLowerCase()
  const isEditorial = (
    lower.includes('réglementation') || lower.includes('règlement général') || lower.includes('politique de confidentialité')
  ) && text.length > 5000

  if (isEditorial) {
    return {
      url, domain, page_type: 'editorial', extractor_used: 'generic',
      compatibility, items_found: 0, items: [],
      status: 'partially_compatible', raw_excerpt: rawExcerpt,
      error_message: 'Page éditoriale — aucune fiche extraite',
    }
  }

  // Detect list vs detail
  const { isList, childLinks } = detectListPage(html, url, domain)

  if (isList && childLinks.length >= 2) {
    // Follow child links and extract one item per page
    const items: ExtractedItem[] = []

    // Process children in parallel (max 5 at a time)
    const BATCH = 5
    for (let i = 0; i < Math.min(childLinks.length, MAX_CHILD_PAGES); i += BATCH) {
      const batch = childLinks.slice(i, i + BATCH)
      const results = await Promise.all(
        batch.map(async (childUrl) => {
          const childHtml = await fetchPage(childUrl)
          if (!childHtml) return null
          return extractItemFromPage(childHtml, childUrl, domain)
        })
      )
      items.push(...results.filter((r): r is ExtractedItem => r !== null))
    }

    const status: SourceStatus = items.length > 0 ? 'compatible' : 'fallback_used'

    return {
      url, domain, page_type: 'list', extractor_used: 'generic-list',
      compatibility, items_found: items.length, items,
      status, raw_excerpt: rawExcerpt,
    }
  }

  // Detail page — extract single item
  const item = extractItemFromPage(html, url, domain)
  const status: SourceStatus = item.confidence_score > 40 ? 'compatible' : 'fallback_used'

  return {
    url, domain, page_type: 'detail', extractor_used: 'generic-detail',
    compatibility, items_found: 1, items: [item],
    status, raw_excerpt: rawExcerpt,
  }
}

export async function analyzeUrls(urls: string[]): Promise<AnalysisResult[]> {
  // Process sequentially to avoid overloading target servers
  const results: AnalysisResult[] = []
  for (const url of urls) {
    results.push(await analyzeUrl(url))
  }
  return results
}
