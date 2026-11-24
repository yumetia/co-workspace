import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-md py-16 text-center">
      <p className="text-brand-600 text-5xl font-bold">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page introuvable</h1>
      <p className="mt-2 text-slate-600">Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="text-brand-600 mt-6 inline-block font-medium hover:underline">
        Retour à l'accueil
      </Link>
    </section>
  )
}
