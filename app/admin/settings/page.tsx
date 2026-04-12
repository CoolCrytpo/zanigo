'use client'

import { useEffect, useState, useCallback } from 'react'
import { Settings } from 'lucide-react'

type Setting = { key: string; value: string }

const FEATURE_TOGGLES = [
  { key: 'feature_comments', label: 'Commentaires & feed' },
  { key: 'feature_events', label: 'Événements' },
  { key: 'feature_encarts', label: 'Encarts / bandeaux' },
  { key: 'feature_pwa_prompt', label: 'Prompt PWA' },
  { key: 'feature_share', label: 'Bouton partager' },
]

const IMPORT_SETTINGS = [
  { key: 'staging_auto_score', label: 'Score de confiance auto', type: 'toggle' as const },
  { key: 'import_max_batch', label: 'Taille max batch import', type: 'number' as const },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((data: { settings: Setting[] }) => {
        const map: Record<string, string> = {}
        for (const s of data.settings ?? []) map[s.key] = s.value
        setSettings(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = useCallback(async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    try {
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      setFlash('Sauvegardé')
      setTimeout(() => setFlash(null), 2000)
    } catch {
      // silent
    }
  }, [])

  const boolVal = (key: string) => settings[key] === 'true'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm" style={{ color: '#9ca3af' }}>
        Chargement…
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Settings size={20} style={{ color: 'var(--color-basalte)' }} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
            Paramètres
          </h1>
        </div>
        {flash && (
          <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: '#dcfce7', color: '#16a34a' }}>
            {flash}
          </span>
        )}
      </div>

      {/* Fonctionnalités */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-basalte)' }}>Fonctionnalités</h2>
        <div className="flex flex-col gap-3">
          {FEATURE_TOGGLES.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <span className="text-sm" style={{ color: '#374151' }}>{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={boolVal(key)}
                onClick={() => save(key, boolVal(key) ? 'false' : 'true')}
                className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-150"
                style={{ background: boolVal(key) ? 'var(--color-vert)' : '#d1d5db' }}>
                <span
                  className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-150 mt-0.5"
                  style={{ transform: boolVal(key) ? 'translateX(1.1rem)' : 'translateX(0.1rem)' }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Import & Staging */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-basalte)' }}>Import &amp; Staging</h2>
        <div className="flex flex-col gap-3">
          {IMPORT_SETTINGS.map(({ key, label, type }) => (
            <div key={key} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <span className="text-sm" style={{ color: '#374151' }}>{label}</span>
              {type === 'toggle' ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={boolVal(key)}
                  onClick={() => save(key, boolVal(key) ? 'false' : 'true')}
                  className="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-150"
                  style={{ background: boolVal(key) ? 'var(--color-vert)' : '#d1d5db' }}>
                  <span
                    className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-150 mt-0.5"
                    style={{ transform: boolVal(key) ? 'translateX(1.1rem)' : 'translateX(0.1rem)' }} />
                </button>
              ) : (
                <input
                  type="number"
                  min={1}
                  max={10000}
                  defaultValue={settings[key] ?? '100'}
                  onBlur={e => save(key, e.target.value)}
                  className="w-24 border rounded-lg px-3 py-1 text-sm text-right focus:outline-none"
                  style={{ borderColor: '#e2e8f0' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modération */}
      <div className="card p-5">
        <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-basalte)' }}>Modération</h2>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm" style={{ color: '#374151' }}>Mode modération</span>
          <select
            defaultValue={settings['moderation_mode'] ?? 'manual'}
            onChange={e => save('moderation_mode', e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none"
            style={{ borderColor: '#e2e8f0' }}>
            <option value="manual">Manuel</option>
            <option value="auto">Automatique</option>
          </select>
        </div>
      </div>
    </div>
  )
}
