'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Listing, ListingCategory, Commune } from '@/lib/types'
import { slugify } from '@/lib/utils'

interface Props {
  listing?: Listing | null
  categories: ListingCategory[]
  communes: Commune[]
}

const TYPES = [
  { value: 'place',   label: '🏠 Lieu' },
  { value: 'spot',    label: '📍 Spot' },
  { value: 'walk',    label: '🥾 Balade' },
  { value: 'service', label: '🐾 Service' },
]

const DOG_POLICIES = [
  { value: 'allowed',     label: '✅ Accepté' },
  { value: 'conditional', label: '⚠️ Sous conditions' },
  { value: 'disallowed',  label: '🚫 Non autorisé' },
  { value: 'unknown',     label: '❓ À confirmer' },
]

const TRUST_LEVELS = [
  { value: 'high',   label: '✓ Élevée' },
  { value: 'medium', label: '~ Moyenne' },
  { value: 'low',    label: '? Faible' },
]

const STATUSES = [
  { value: 'draft',          label: 'Brouillon' },
  { value: 'pending_review', label: 'En attente' },
  { value: 'published',      label: 'Publié' },
  { value: 'needs_recheck',  label: 'À revérifier' },
  { value: 'archived',       label: 'Archivé' },
]

const DIFFICULTIES = [
  { value: 'easy',     label: 'Facile' },
  { value: 'moderate', label: 'Modéré' },
  { value: 'hard',     label: 'Difficile' },
  { value: 'expert',   label: 'Expert' },
]

export function ListingForm({ listing, categories, communes }: Props) {
  const router = useRouter()
  const isNew = !listing

  const [type, setType]                     = useState(listing?.type ?? 'place')
  const [title, setTitle]                   = useState(listing?.title ?? '')
  const [slug, setSlug]                     = useState(listing?.slug ?? '')
  const [slugManual, setSlugManual]         = useState(!isNew)
  const [categoryId, setCategoryId]         = useState(listing?.category?.id ?? '')
  const [communeId, setCommuneId]           = useState(listing?.commune_id ?? '')
  const [address, setAddress]               = useState(listing?.address ?? '')
  const [lat, setLat]                       = useState(listing?.lat?.toString() ?? '')
  const [lng, setLng]                       = useState(listing?.lng?.toString() ?? '')
  const [dogPolicy, setDogPolicy]           = useState<'allowed' | 'conditional' | 'disallowed' | 'unknown'>(listing?.dog_policy_status ?? 'unknown')
  const [dogRules, setDogRules]             = useState(listing?.dog_policy_rules ?? '')
  const [shortDesc, setShortDesc]           = useState(listing?.short_description ?? '')
  const [longDesc, setLongDesc]             = useState(listing?.long_description ?? '')
  const [phone, setPhone]                   = useState(listing?.contact_phone ?? '')
  const [email, setEmail]                   = useState(listing?.contact_email ?? '')
  const [website, setWebsite]               = useState(listing?.website_url ?? '')
  const [trustLevel, setTrustLevel]         = useState<'high' | 'medium' | 'low'>(listing?.trust_level ?? 'low')
  const [verifiedAt, setVerifiedAt]         = useState(
    listing?.verified_at ? listing.verified_at.slice(0, 10) : ''
  )
  const [status, setStatus]                 = useState<'draft' | 'pending_review' | 'published' | 'needs_recheck' | 'archived' | 'conflict'>(listing?.verification_status ?? 'draft')
  const [isPublished, setIsPublished]       = useState(listing?.is_published ?? false)
  const [isFeatured, setIsFeatured]         = useState(listing?.is_featured ?? false)

  // Trail details
  const td = listing?.trail_details
  const [difficulty, setDifficulty]         = useState<'easy' | 'moderate' | 'hard' | 'expert'>(td?.difficulty ?? 'easy')
  const [distanceKm, setDistanceKm]         = useState(td?.distance_km?.toString() ?? '')
  const [elevationM, setElevationM]         = useState(td?.elevation_m?.toString() ?? '')
  const [durationMin, setDurationMin]       = useState(td?.duration_minutes?.toString() ?? '')
  const [leashRequired, setLeashRequired]   = useState(td?.leash_required ?? false)
  const [hasWater, setHasWater]             = useState(td?.has_water_points ?? false)
  const [waterDesc, setWaterDesc]           = useState(td?.water_points_desc ?? '')
  const [regulatedZones, setRegulatedZones] = useState(td?.regulated_zones ?? '')

  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const filteredCategories = categories.filter((c) => c.listing_type === type)

  const handleTitleChange = (v: string) => {
    setTitle(v)
    if (!slugManual) setSlug(slugify(v))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const body = {
      type,
      slug,
      title,
      short_description: shortDesc || null,
      long_description: longDesc || null,
      commune_id: communeId || null,
      category_id: categoryId || null,
      address: address || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      dog_policy_status: dogPolicy,
      dog_policy_rules: dogRules || null,
      trust_level: trustLevel,
      verified_at: verifiedAt || null,
      verification_status: status,
      is_published: isPublished,
      is_featured: isFeatured,
      contact_phone: phone || null,
      contact_email: email || null,
      website_url: website || null,
      trail_details: type === 'walk' ? {
        difficulty,
        distance_km: distanceKm ? parseFloat(distanceKm) : null,
        elevation_m: elevationM ? parseFloat(elevationM) : null,
        duration_minutes: durationMin ? parseInt(durationMin) : null,
        leash_required: leashRequired,
        has_water_points: hasWater,
        water_points_desc: waterDesc || null,
        regulated_zones: regulatedZones || null,
      } : null,
    }

    try {
      const url = isNew ? '/api/admin/listings' : `/api/admin/listings/${listing.id}`
      const method = isNew ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur')

      const id = isNew ? data.id : listing.id
      router.push(`/admin/listings/${id}`)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white'
  const labelCls = 'text-xs font-semibold text-gray-600 block mb-1'
  const sectionCls = 'bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4'

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          {isNew ? 'Nouvelle fiche' : `Éditer — ${listing.title}`}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: 'var(--color-vert)' }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm text-red-700 bg-red-50 border border-red-200">
          {error}
        </div>
      )}

      {/* Statut / publication */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Publication</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputCls}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => {
                  setIsPublished(e.target.checked)
                  if (e.target.checked) setStatus('published')
                }}
                className="w-4 h-4 rounded accent-green-700"
              />
              <span className="text-sm font-medium text-gray-700">Publié</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded accent-yellow-500"
              />
              <span className="text-sm font-medium text-gray-700">⭐ Mis à la une</span>
            </label>
          </div>
        </div>
      </div>

      {/* Identité */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identité</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Type *</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value as typeof type); setCategoryId('') }}
              className={inputCls}
            >
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Catégorie</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">— Choisir —</option>
              {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Nom *</label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            placeholder="Nom du lieu"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Slug *{' '}
            <span className="font-normal text-gray-400">(URL)</span>
          </label>
          <div className="flex gap-2">
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
              required
              placeholder="mon-lieu"
              className={`${inputCls} font-mono`}
            />
            <button
              type="button"
              onClick={() => { setSlug(slugify(title)); setSlugManual(false) }}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 whitespace-nowrap"
            >
              Régénérer
            </button>
          </div>
        </div>
      </div>

      {/* Localisation */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Localisation</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Commune</label>
            <select value={communeId} onChange={(e) => setCommuneId(e.target.value)} className={inputCls}>
              <option value="">— Choisir —</option>
              {communes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Adresse</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Adresse complète" className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Latitude</label>
            <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="-21.0080" type="number" step="any" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Longitude</label>
            <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="55.2728" type="number" step="any" className={inputCls} />
          </div>
        </div>
      </div>

      {/* Politique chiens */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chiens</h2>
        <div>
          <label className={labelCls}>Statut *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DOG_POLICIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setDogPolicy(p.value as typeof dogPolicy)}
                className="py-2 px-3 rounded-lg border text-xs font-medium transition-all"
                style={{
                  borderColor: dogPolicy === p.value ? 'var(--color-vert)' : '#e5e7eb',
                  background: dogPolicy === p.value ? 'var(--color-vert-light)' : '#fff',
                  color: dogPolicy === p.value ? 'var(--color-vert)' : '#6b7280',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelCls}>Conditions / détail</label>
          <textarea
            value={dogRules}
            onChange={(e) => setDogRules(e.target.value)}
            rows={2}
            placeholder="Ex: chiens tenus en laisse, terrasse uniquement…"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* Description */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</h2>
        <div>
          <label className={labelCls}>Résumé court</label>
          <textarea
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            rows={2}
            placeholder="Accroche courte (affiché sur les cartes)"
            className={`${inputCls} resize-none`}
          />
        </div>
        <div>
          <label className={labelCls}>Description longue</label>
          <textarea
            value={longDesc}
            onChange={(e) => setLongDesc(e.target.value)}
            rows={5}
            placeholder="Description complète…"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* Infos pratiques */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Téléphone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0262 XX XX XX" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="contact@..." className={inputCls} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Site web</label>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} type="url" placeholder="https://..." className={inputCls} />
        </div>
      </div>

      {/* Trail details (walk only) */}
      {type === 'walk' && (
        <div className={sectionCls}>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Détails balade</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Difficulté</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as typeof difficulty)} className={inputCls}>
                {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Distance (km)</label>
              <input value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} type="number" step="0.1" placeholder="5.2" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Dénivelé (m)</label>
              <input value={elevationM} onChange={(e) => setElevationM(e.target.value)} type="number" placeholder="350" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Durée (min)</label>
              <input value={durationMin} onChange={(e) => setDurationMin(e.target.value)} type="number" placeholder="120" className={inputCls} />
            </div>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={leashRequired} onChange={(e) => setLeashRequired(e.target.checked)} className="w-4 h-4 rounded accent-green-700" />
              <span className="text-sm text-gray-700">Laisse obligatoire</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={hasWater} onChange={(e) => setHasWater(e.target.checked)} className="w-4 h-4 rounded accent-green-700" />
              <span className="text-sm text-gray-700">Point d&apos;eau</span>
            </label>
          </div>
          {hasWater && (
            <div>
              <label className={labelCls}>Description point d&apos;eau</label>
              <input value={waterDesc} onChange={(e) => setWaterDesc(e.target.value)} placeholder="Ex: source au km 3" className={inputCls} />
            </div>
          )}
          <div>
            <label className={labelCls}>Zones réglementées</label>
            <input value={regulatedZones} onChange={(e) => setRegulatedZones(e.target.value)} placeholder="Ex: Réserve naturelle, accès restreint…" className={inputCls} />
          </div>
        </div>
      )}

      {/* Fiabilité */}
      <div className={sectionCls}>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fiabilité</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Niveau de confiance</label>
            <select value={trustLevel} onChange={(e) => setTrustLevel(e.target.value as typeof trustLevel)} className={inputCls}>
              {TRUST_LEVELS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Date de vérification</label>
            <input
              value={verifiedAt}
              onChange={(e) => setVerifiedAt(e.target.value)}
              type="date"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Submit bottom */}
      <div className="flex justify-end gap-2 pb-8">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
          Annuler
        </button>
        <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'var(--color-vert)' }}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
