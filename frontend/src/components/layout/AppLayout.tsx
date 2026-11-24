import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'

/** Liens de navigation principaux : chaque module ajoutera son entrée ici. */
const NAV_LINKS: { to: string; label: string }[] = [{ to: '/', label: 'Accueil' }]

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-brand-600 text-lg font-bold tracking-tight">
            CoWork'Space
          </Link>

          <button
            type="button"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">☰</span>
          </button>

          <nav
            id="main-nav"
            className={`${menuOpen ? 'flex' : 'hidden'} absolute top-16 right-0 left-0 flex-col gap-1 border-b border-slate-200 bg-white p-4 md:static md:flex md:flex-row md:border-0 md:p-0`}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        CoWork'Space · Réservation d'espaces de travail
      </footer>
    </div>
  )
}
