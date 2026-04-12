import type { Metadata } from 'next'
import { BarChart2 } from 'lucide-react'

export const metadata: Metadata = { title: 'Statistiques — Admin Zanimo Guide' }

export default function StatsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart2 size={22} style={{ color: '#6366f1' }} />
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Statistiques</h1>
      </div>

      <div className="rounded-xl border-2 border-dashed p-10 text-center" style={{ borderColor: '#e5e7eb' }}>
        <BarChart2 size={40} className="mx-auto mb-3" style={{ color: '#d1d5db' }} />
        <p className="font-semibold text-sm mb-1" style={{ color: '#374151' }}>Tableau de bord à venir</p>
        <p className="text-sm" style={{ color: '#9ca3af', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
          Cette section affichera les indicateurs clés : nombre de fiches, de contributions, de visiteurs,
          réactions par lieu, catégories les plus consultées, évolution mensuelle et annuelle.
        </p>
      </div>

      {/* Placeholder blocs — structure prévue */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Fiches publiées', color: '#2A74E6' },
          { label: 'Contributions reçues', color: '#1FA97E' },
          { label: 'Visiteurs (30j)', color: '#F4B73F' },
          { label: 'Réactions totales', color: '#8B5CF6' },
        ].map(({ label, color }) => (
          <div key={label} className="rounded-xl border p-4" style={{ borderColor: '#e5e7eb', background: '#f9fafb' }}>
            <div className="h-6 w-16 rounded mb-2 animate-pulse" style={{ background: '#e5e7eb' }} />
            <p className="text-xs font-medium" style={{ color: '#6b7280' }}>{label}</p>
            <div className="h-1 rounded-full mt-2" style={{ background: `${color}20` }}>
              <div className="h-1 rounded-full w-0" style={{ background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
