'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { CheckCircle, Upload, Link2, X, Lock, Sparkles } from 'lucide-react'

const DOG_POLICIES = [
  { value: 'allowed',     label: 'Accepté' },
  { value: 'conditional', label: 'Sous conditions' },
  { value: 'disallowed',  label: 'Non autorisé' },
  { value: 'unknown',     label: 'Je ne sais pas' },
]

export type ContributionMode = 'lieu' | 'service'

interface Props {
  mode: ContributionMode
}

export function ContributionForm({ mode }: Props) {
  const isService = mode === 'service'
  const defaultListingType = isService ? 'service' : 'place'

  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [commune, setCommune] = useState('')
  const [dogPolicy, setDogPolicy] = useState('unknown')
  const [conditions, setConditions] = useState('')
  const [source, setSource] = useState('')
  const [rgpdConsent, setRgpdConsent] = useState(false)

  // Image — URL ou fichier
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setError('Image trop volumineuse (max 5 Mo).'); return }
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
    setError(null)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rgpdConsent) { setError('Acceptez la politique de confidentialité pour continuer.'); return }
    setSubmitting(true)
    setError(null)

    let cover_url: string | undefined

    // Upload image if file mode
    if (imageMode === 'file' && imageFile) {
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', imageFile)
        const upRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await upRes.json()
        if (!upRes.ok) throw new Error(upData.error ?? 'Erreur upload')
        cover_url = upData.url
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'image.')
        setUploading(false)
        setSubmitting(false)
        return
      }
      setUploading(false)
    } else if (imageMode === 'url' && imageUrl) {
      cover_url = imageUrl
    }

    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'new_listing',
          data: {
            pseudo, email, name, address, commune,
            listing_type: defaultListingType,
            dog_policy: dogPolicy,
            conditions, source,
            cover_url,
          },
        }),
      })
      if (!res.ok) throw new Error()
      setSuccess(true)
    } catch {
      setError('Erreur lors de l\'envoi. Réessaie plus tard.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="section" style={{ background: 'var(--color-canvas)' }}>
        <div className="container max-w-lg text-center py-16">
          <div className="flex justify-center mb-4">
            <CheckCircle size={52} style={{ color: 'var(--color-green)' }} strokeWidth={1.5} />
          </div>
          <h1 className="text-h1 mb-3" style={{ color: 'var(--color-text)' }}>Merci !</h1>
          <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
            Ta contribution a bien été reçue. On la vérifie avant publication.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="section" style={{ background: 'var(--color-canvas)' }}>
      <div className="container max-w-lg">
        <h1 className="text-h1 mb-2" style={{ color: 'var(--color-text)' }}>
          {isService ? 'Proposer un service' : 'Ajouter un lieu'}
        </h1>
        <p className="text-body mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          {isService
            ? 'Vétérinaire, toiletteur, pension, éducateur… Partage un service pour animaux à La Réunion.'
            : 'Tu connais un restaurant, hébergement ou spot ouvert aux animaux à La Réunion ? Partage-le.'}
        </p>

        <form onSubmit={onSubmit} className="card p-6 flex flex-col gap-5">

          {/* Pseudo + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-text)' }}>Votre pseudo</label>
              <input value={pseudo} onChange={e => setPseudo(e.target.value)}
                placeholder="Ex: PetitChien974"
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-text)' }}>Votre email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="pour vous répondre"
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-border)' }} />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-text)' }}>
              {isService ? 'Nom du service *' : 'Nom du lieu *'}
            </label>
            <input value={name} onChange={e => setName(e.target.value)} required
              placeholder={isService ? 'Ex: Clinique Vétérinaire du Volcan' : 'Ex: Plage de l\'Hermitage'}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }} />
          </div>

          {/* Commune + Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-text)' }}>Commune</label>
              <input value={commune} onChange={e => setCommune(e.target.value)}
                placeholder="Ex: Saint-Paul"
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-border)' }} />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-text)' }}>Adresse</label>
              <input value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Adresse ou URL Maps"
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-border)' }} />
            </div>
          </div>

          {/* Dog policy */}
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--color-text)' }}>Accueil des animaux</label>
            <div className="grid grid-cols-2 gap-2">
              {DOG_POLICIES.map(p => (
                <button key={p.value} type="button" onClick={() => setDogPolicy(p.value)}
                  className="text-sm py-2 px-3 rounded-xl border font-medium transition-all"
                  style={{
                    borderColor: dogPolicy === p.value ? 'var(--color-green)' : 'var(--color-border)',
                    background: dogPolicy === p.value ? 'var(--color-green-light)' : '#fff',
                    color: dogPolicy === p.value ? 'var(--color-green)' : 'var(--color-muted)',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-text)' }}>Conditions ou remarques</label>
            <textarea value={conditions} onChange={e => setConditions(e.target.value)}
              placeholder="Ex: chiens tenus en laisse, terrasse uniquement…" rows={2}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ borderColor: 'var(--color-border)' }} />
          </div>

          {/* Source */}
          <div>
            <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--color-text)' }}>Source de l&apos;info</label>
            <input value={source} onChange={e => setSource(e.target.value)}
              placeholder="URL, vu sur place, site officiel…"
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }} />
          </div>

          {/* Image */}
          <div>
            <label className="text-sm font-semibold block mb-2" style={{ color: 'var(--color-text)' }}>
              Image du lieu (facultatif)
            </label>
            {/* Toggle URL / Upload */}
            <div className="flex gap-2 mb-3">
              {[
                { key: 'url',  label: 'Lien URL',   icon: Link2 },
                { key: 'file', label: 'Envoyer un fichier', icon: Upload },
              ].map(({ key, label, icon: Icon }) => (
                <button key={key} type="button"
                  onClick={() => { setImageMode(key as 'url' | 'file'); clearImage() }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all"
                  style={{
                    borderColor: imageMode === key ? 'var(--color-blue)' : 'var(--color-border)',
                    background: imageMode === key ? 'var(--color-blue-light)' : '#fff',
                    color: imageMode === key ? 'var(--color-blue)' : 'var(--color-muted)',
                  }}>
                  <Icon size={11} />
                  {label}
                </button>
              ))}
            </div>

            {imageMode === 'url' ? (
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{ borderColor: 'var(--color-border)' }} />
            ) : (
              <div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleFile} className="hidden" />
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ height: '140px' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                    <button type="button" onClick={clearImage}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full py-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
                    <Upload size={20} strokeWidth={1.5} />
                    <span className="text-xs">JPG, PNG, WebP — max 5 Mo</span>
                  </button>
                )}
              </div>
            )}
            <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
              Format recommandé : 16/9, au moins 800×450 px.
            </p>
          </div>

          {/* ─── FREEMIUM — Mise en avant (désactivé, bientôt dispo) ─── */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-canvas)', border: '1px solid var(--color-border)', opacity: 0.65 }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: '#F4B73F' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  Mise en avant
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: '#F3EEFF', color: '#8B5CF6' }}>
                <Lock size={9} /> Bientôt disponible
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Mettez votre lieu à la une, bénéficiez d&apos;une position prioritaire dans les résultats
              et d&apos;une communication dédiée. Cette option payante sera disponible prochainement.
            </p>
          </div>

          {/* RGPD */}
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={rgpdConsent} onChange={e => setRgpdConsent(e.target.checked)}
              className="mt-0.5 accent-green-700 flex-shrink-0" />
            <span className="text-xs" style={{ color: 'var(--color-muted)', lineHeight: 1.5 }}>
              J&apos;accepte que mes données (pseudo, email, informations du lieu) soient utilisées pour traiter
              cette contribution. Aucune revente à des tiers.{' '}
              <Link href="/privacy" className="underline" style={{ color: 'var(--color-green)' }}>
                Politique de confidentialité
              </Link>
            </span>
          </label>

          {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{error}</p>}

          <button type="submit"
            disabled={submitting || uploading || !name.trim() || !rgpdConsent}
            className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: isService ? 'var(--color-green)' : '#2A74E6' }}>
            {uploading ? 'Envoi de l\'image…' : submitting ? 'Envoi en cours…' : isService ? 'Envoyer ma proposition' : 'Ajouter ce lieu'}
          </button>

          <p className="text-caption text-center">Toute contribution est vérifiée avant publication.</p>
        </form>
      </div>
    </div>
  )
}
