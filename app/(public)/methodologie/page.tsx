import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notre méthode — ZaniGo',
  description: 'Comment ZaniGo vérifie et publie ses fiches dog-friendly à La Réunion.',
}

export default function MethodologiePage() {
  return (
    <div className="section" style={{ background: 'var(--color-sable)' }}>
      <div className="container max-w-2xl">
        <p className="text-overline mb-3" style={{ color: 'var(--color-vert)' }}>Transparence</p>
        <h1 className="text-h1 mb-6" style={{ color: 'var(--color-basalte)' }}>Notre méthode</h1>

        <div className="flex flex-col gap-6">
          {[
            {
              icon: '🔍',
              title: 'On vérifie avant de publier',
              body: 'Aucune fiche n\'est publiée automatiquement. Chaque information est vérifiée par notre équipe avant d\'apparaître sur ZaniGo.',
            },
            {
              icon: '📅',
              title: 'On date toujours l\'information',
              body: 'Chaque fiche indique la date de sa dernière vérification. L\'info sans date ne vaut rien.',
            },
            {
              icon: '🎯',
              title: 'On source toujours',
              body: 'Toute politique chien indiquée vient d\'une source précise : site officiel, vérification sur place, retour de la communauté.',
            },
            {
              icon: '❓',
              title: 'On affiche l\'incertitude',
              body: 'Si on ne sait pas avec certitude, on l\'indique. Le statut "À confirmer" est une information utile, pas un aveu de faiblesse.',
            },
            {
              icon: '🔄',
              title: 'On revalide régulièrement',
              body: 'Les fiches sont signalées pour revérification après un délai raisonnable. La communauté peut aussi signaler une erreur.',
            },
          ].map((item) => (
            <div key={item.title} className="card p-6">
              <div className="flex gap-4">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h2 className="text-h3 mb-2" style={{ color: 'var(--color-basalte)' }}>{item.title}</h2>
                  <p className="text-body" style={{ color: 'var(--color-muted)' }}>{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
