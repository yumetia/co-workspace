import { useQuery } from '@tanstack/react-query'
import { getHealth } from '../../api/health'

/**
 * Page d'accueil provisoire : vérifie seulement que le frontend communique avec l'API.
 * Elle sera remplacée par le plan des espaces (module Visualisation).
 */
export function HomePage() {
  const health = useQuery({ queryKey: ['health'], queryFn: getHealth })

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Bienvenue sur CoWork'Space</h1>
      <p className="text-slate-600">
        Réservez votre poste en open space ou une salle de réunion en quelques clics.
      </p>
      <p className="text-sm" role="status">
        Statut de l'API :{' '}
        {health.isPending && <span className="text-slate-500">vérification…</span>}
        {health.isError && <span className="text-status-busy font-medium">injoignable</span>}
        {health.data && (
          <span
            className={
              health.data.status === 'UP'
                ? 'text-status-free font-medium'
                : 'text-status-busy font-medium'
            }
          >
            {health.data.status === 'UP' ? 'opérationnelle' : 'indisponible'}
          </span>
        )}
      </p>
    </section>
  )
}
