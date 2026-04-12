import type { Metadata } from 'next'
import { Search, Calendar, Target, HelpCircle, RefreshCw } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Notre méthode — Zanimo Guide',
  description: 'Comment Zanimo Guide vérifie et publie ses fiches dog-friendly à La Réunion.',
}

const STEPS = [
  {
    Icon: Search,
    color: '#2A74E6',
    bg: '#EEF4FF',
    title: 'On vérifie avant de publier',
    body: 'Aucune fiche n\'est publiée automatiquement. Chaque information est vérifiée par notre équipe avant d\'apparaître sur Zanimo Guide. Le délai moyen de vérification est de 72h.',
  },
  {
    Icon: Calendar,
    color: '#1FA97E',
    bg: '#EDFBF5',
    title: 'On date toujours l\'information',
    body: 'Chaque fiche indique la date de sa dernière vérification. L\'info sans date ne vaut rien.',
  },
  {
    Icon: Target,
    color: '#FF6B57',
    bg: '#FFF3F1',
    title: 'On source toujours',
    body: 'Toute politique chien indiquée vient d\'une source précise : site officiel, vérification sur place, retour de la communauté.',
  },
  {
    Icon: HelpCircle,
    color: '#F4B73F',
    bg: '#FFF8E6',
    title: 'On affiche l\'incertitude',
    body: 'Si on ne sait pas avec certitude, on l\'indique. Le statut "À confirmer" est une information utile, pas un aveu de faiblesse.',
  },
  {
    Icon: RefreshCw,
    color: '#8B5CF6',
    bg: '#F3EEFF',
    title: 'On revalide régulièrement',
    body: 'Les fiches sont signalées pour revérification après un délai raisonnable. La communauté peut aussi signaler une erreur.',
  },
]

export default function MethodologiePage() {
  return (
    <div className="section" style={{ background: 'var(--color-canvas)' }}>
      <div className="container max-w-2xl">
        <p className="text-overline mb-3" style={{ color: 'var(--color-green)' }}>Transparence</p>
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-text)' }}>Notre méthode</h1>

        <div className="flex flex-col gap-4">
          {STEPS.map((item) => (
            <div key={item.title} className="card p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.bg }}>
                  <item.Icon size={18} style={{ color: item.color }} strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-h3 mb-2" style={{ color: 'var(--color-text)' }}>{item.title}</h2>
                  <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
