import { requireSession } from '@/lib/auth/session'
import { getBatches } from '@/lib/ingestion/queries'
import Link from 'next/link'
import type { ImportBatch } from '@/lib/ingestion/types'

const BATCH_STATUS_LABEL: Record<string, string> = {
  pending_analysis: 'Analyse…', analyzed: 'Analysé',
  imported_to_staging: 'En staging', partially_failed: 'Partiel',
  failed: 'Échec', completed: 'Terminé',
}
const BATCH_STATUS_COLOR: Record<string, string> = {
  pending_analysis: '#6b7280', analyzed: '#2563eb',
  imported_to_staging: '#7c3aed', partially_failed: '#d97706',
  failed: '#dc2626', completed: '#16a34a',
}

export default async function ImportDashboardPage() {
  await requireSession()
  let batches: ImportBatch[] = []
  try { batches = await getBatches(20) } catch { /* DB */ }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-basalte)', fontFamily: 'var(--font-display)' }}>
          Import de données
        </h1>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/import/urls" className="card p-5 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">🔗</div>
          <h2 className="font-semibold mb-1" style={{ color: 'var(--color-basalte)' }}>Importer des URLs</h2>
          <p className="text-sm text-gray-500">Analyser une ou plusieurs pages web pour extraire des lieux</p>
        </Link>
        <Link href="/admin/import/csv" className="card p-5 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">📄</div>
          <h2 className="font-semibold mb-1" style={{ color: 'var(--color-basalte)' }}>Importer un CSV</h2>
          <p className="text-sm text-gray-500">Importer un fichier CSV complété manuellement</p>
        </Link>
        <Link href="/admin/import/xlsx" className="card p-5 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">📊</div>
          <h2 className="font-semibold mb-1" style={{ color: 'var(--color-basalte)' }}>XLS / Google Sheet</h2>
          <p className="text-sm text-gray-500">Importer un fichier Excel ou un Google Sheet public avec mapping de colonnes</p>
        </Link>
        <Link href="/admin/listings/new" className="card p-5 hover:shadow-md transition-shadow">
          <div className="text-2xl mb-2">✏️</div>
          <h2 className="font-semibold mb-1" style={{ color: 'var(--color-basalte)' }}>Fiche manuelle</h2>
          <p className="text-sm text-gray-500">Créer une fiche de zéro sans import préalable</p>
        </Link>
      </div>

      {/* Quick links */}
      <div className="flex gap-3 mb-6">
        <Link
          href="/admin/staging"
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
          style={{ background: 'var(--color-vert)' }}
        >
          📋 Zone de staging
        </Link>
        <Link
          href="/admin/requests"
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
          style={{ background: 'var(--color-lagon)' }}
        >
          📬 Demandes de correction/retrait
        </Link>
        <a
          href="/api/admin/import/batch/template"
          className="text-sm font-semibold px-4 py-2 rounded-lg border"
          style={{ borderColor: '#e2e8f0', color: '#374151' }}
        >
          ⬇️ Template CSV
        </a>
      </div>

      {/* Batches */}
      <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-basalte)' }}>
        Derniers imports
      </h2>

      {batches.length === 0 ? (
        <div className="card p-6 text-center text-sm text-gray-400">Aucun import encore effectué</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: '#e2e8f0' }}>
                {['Label', 'Type', 'Statut', 'Extraits', 'Importés', 'Doublons', 'Date'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr key={b.id} className="border-b hover:bg-gray-50" style={{ borderColor: '#f1f5f9' }}>
                  <td className="py-2 px-3 font-medium" style={{ color: 'var(--color-basalte)' }}>
                    {b.label || '—'}
                  </td>
                  <td className="py-2 px-3 text-gray-500">{b.source_type}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ background: BATCH_STATUS_COLOR[b.status] ?? '#6b7280' }}>
                      {BATCH_STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-500">{b.total_extracted}</td>
                  <td className="py-2 px-3 text-gray-500">{b.total_imported}</td>
                  <td className="py-2 px-3 text-gray-500">{b.total_duplicates}</td>
                  <td className="py-2 px-3 text-gray-400">
                    {new Date(b.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
