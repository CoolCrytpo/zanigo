// ─────────────────────────────────────────────
// ZaniGo — URL extractor (server-side, no external deps)
// ─────────────────────────────────────────────

import type { AnalysisResult, ExtractedItem, Compatibility, PageType, SourceStatus, DogPolicyRaw } from './types'

const TIMEOUT_MS = 10_000

// ── Keyword banks ─────────────────────────────

const POSITIVE_KW = [
  'animaux acceptés','animaux admis','animaux bienvenus','chiens acceptés','chiens admis',
  'chiens bienvenus','pet friendly','pets allowed','dog friendly','dogs allowed',
  'animaux autorisés','chiens autorisés','nos amis les bêtes','accompagné de votre animal',
]
const CONDITIONAL_KW = [
  'sous conditions','petits animaux','chiens de moins','petit chien','laisse obligatoire',
  'terrasse uniquement','terrasse seulement','supplément','supplement','animaux de petite taille',
  'dogs on leash','on leash only','en terrasse','pets on leash',
]
const NEGATIVE_KW = [
  'animaux non admis','animaux non autorisés','chiens interdits','animaux interdits',
  'no pets','pets not allowed','dogs not allowed','chiens non acceptés',
]

// ── HTML utilities ────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function extractMeta(html: string, name: string): string {
  const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'))
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${name}["']`, 'i'))
  return m ? m[1].trim() : ''
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'og:title')
  if (og) return og
  const t = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return t ? t[1].replace(/\s*[-|].*$/, '').trim() : ''
}

function extractLinks(html: string, baseUrl: string): string[] {
  const links: string[] = []
  const re = /href=["']([^"'#?]+)["']/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      const abs = new URL(m[1], baseUrl).href
      if (!links.includes(abs)) links.push(abs)
    } catch { /* skip malformed */ }
  }
  return links
}

// ── Dog policy detection ──────────────────────

function detectDogPolicy(text: string): { policy: DogPolicyRaw; excerpt: string; score: number } {
  const lower = text.toLowerCase()
  for (const kw of NEGATIVE_KW) {
    if (lower.includes(kw)) {
      const idx = lower.indexOf(kw)
      return { policy: 'no', excerpt: text.slice(Math.max(0, idx - 30), idx + kw.length + 60).trim(), score: 70 }
    }
  }
  for (const kw of CONDITIONAL_KW) {
    if (lower.includes(kw)) {
      const idx = lower.indexOf(kw)
      return { policy: 'conditional', excerpt: text.slice(Math.max(0, idx - 30), idx + kw.length + 80).trim(), score: 65 }
    }
  }
  for (const kw of POSITIVE_KW) {
    if (lower.includes(kw)) {
      const idx = lower.indexOf(kw)
      return { policy: 'yes', excerpt: text.slice(Math.max(0, idx - 30), idx + kw.length + 80).trim(), score: 80 }
    }
  }
  return { policy: 'unknown', excerpt: '', score: 20 }
}

// ── Field extractors ──────────────────────────

function extractPhone(text: string): string {
  const m = text.match(/(?:(?:\+262|0262|0692|0693)\s?[\d\s]{6,12}|\b0[1-9](?:[\s.-]?\d{2}){4}\b)/)
  return m ? m[0].replace(/\s+/g, ' ').trim() : ''
}

function extractEmail(text: string): string {
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
  return m ? m[0] : ''
}

function extractWebsite(html: string, domain: string): string {
  const links = extractLinks(html, 'https://' + domain)
  return links.find(l => !l.includes(domain) && /^https?:\/\//.test(l) && !l.includes('facebook') && !l.includes('tripadvisor')) ?? ''
}

function extractCommune(text: string): string {
  const COMMUNES = [
    'Saint-Denis','Saint-Paul','Saint-Pierre','Le Tampon','Saint-Louis','Saint-André',
    'Saint-Benoît','Saint-Joseph','Sainte-Marie','Sainte-Rose','Saint-Leu','Cilaos',
    'Entre-Deux','L\'Étang-Salé','Petite-Île','Les Avirons','Saint-Philippe','Sainte-Suzanne',
    'Bras-Panon','La Plaine-des-Palmistes','La Possession','Le Port','Saint-Gilles',
    'Trois-Bassins',
  ]
  for (const c of COMMUNES) {
    if (text.includes(c)) return c
  }
  return ''
}

// ── Page type detection ───────────────────────

function detectPageType(html: string, text: string): PageType {
  const lowerText = text.toLowerCase()
  const listSignals = (html.match(/<(?:article|li|card|\.card)[^>]*>/gi) ?? []).length
  if (listSignals > 5) return 'list'
  if (lowerText.includes('réglementation') || lowerText.includes('règlement') || lowerText.includes('politique')) return 'editorial'
  if (lowerText.includes('horaires') || lowerText.includes('adresse') || extractPhone(text)) return 'detail'
  return 'unknown'
}

// ── Compatibility ─────────────────────────────

function detectCompatibility(domain: string): Compatibility {
  const EXCELLENT = ['reunion.fr', 'irt.re', 'bringfido.com']
  const GOOD = ['tripadvisor.fr', 'tripadvisor.com', 'booking.com', 'airbnb.fr']
  const LOW = ['facebook.com', 'instagram.com']
  if (EXCELLENT.some(d => domain.includes(d))) return 'excellent'
  if (GOOD.some(d => domain.includes(d))) return 'good'
  if (LOW.some(d => domain.includes(d))) return 'low'
  return 'medium'
}

// ── Generic extractor ─────────────────────────

function extractDetailItem(html: string, text: string, url: string, domain: string): ExtractedItem {
  const name = extractTitle(html) || 'Lieu sans nom'
  const { policy, excerpt, score } = detectDogPolicy(text)
  const commune = extractCommune(text)

  // Confidence boosters
  let confidence = score
  if (commune) confidence += 5
  if (extractPhone(text)) confidence += 5
  if (excerpt) confidence += 5
  confidence = Math.min(confidence, 95)

  return {
    name,
    commune_name: commune || undefined,
    phone: extractPhone(text) || undefined,
    email: extractEmail(text) || undefined,
    website: extractWebsite(html, domain) || undefined,
    dog_policy: policy,
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

  let html = ''
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ZaniGoBot/1.0; +https://zanigo.re)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      url, domain, page_type: 'error', extractor_used: 'fetch',
      compatibility: 'failed', items_found: 0, items: [],
      status: 'error', error_message: `Erreur réseau : ${msg}`,
    }
  }

  const text = stripHtml(html)
  const rawExcerpt = text.slice(0, 500)
  const pageType = detectPageType(html, text)

  if (pageType === 'editorial') {
    return {
      url, domain, page_type: 'editorial', extractor_used: 'generic',
      compatibility, items_found: 0, items: [],
      status: 'partially_compatible',
      raw_excerpt: rawExcerpt,
      error_message: 'Page éditoriale — aucune fiche extraite',
    }
  }

  const items: ExtractedItem[] = [extractDetailItem(html, text, url, domain)]
  const status: SourceStatus = items[0].confidence_score > 50 ? 'compatible' : 'fallback_used'

  return {
    url, domain, page_type: pageType,
    extractor_used: 'generic',
    compatibility,
    items_found: items.length,
    items,
    status,
    raw_excerpt: rawExcerpt,
  }
}

export async function analyzeUrls(urls: string[]): Promise<AnalysisResult[]> {
  return Promise.all(urls.map(analyzeUrl))
}
