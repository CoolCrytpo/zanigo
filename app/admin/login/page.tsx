'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { APP_NAME } from '@/config/constants'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Identifiants incorrects')
        return
      }
      router.push('/admin')
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-4"
      style={{ background: 'var(--color-sable)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span
            className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-white text-xl font-black mb-3"
            style={{ background: 'var(--color-vert)' }}
          >
            Z
          </span>
          <h1 className="text-h2" style={{ color: 'var(--color-basalte)' }}>
            {APP_NAME} Admin
          </h1>
        </div>

        <form onSubmit={onSubmit} className="card p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-basalte)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)' }}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'var(--color-vert)' }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
