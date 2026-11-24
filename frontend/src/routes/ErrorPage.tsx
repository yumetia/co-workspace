import { Link, useRouteError } from 'react-router'

/** Affichée si une erreur inattendue survient pendant le rendu d'une page. */
export function ErrorPage() {
  const error = useRouteError()
  console.error(error)

  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Une erreur est survenue</h1>
      <p className="mt-2 text-slate-600">Rechargez la page ou revenez à l'accueil.</p>
      <Link to="/" className="text-brand-600 mt-6 inline-block font-medium hover:underline">
        Retour à l'accueil
      </Link>
    </main>
  )
}
