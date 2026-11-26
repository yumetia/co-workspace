import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router'

/** Liens de navigation principaux : chaque module ajoutera son entrée ici. */
const NAV_LINKS: { to: string; label: string }[] = [
  { to: '/', label: 'Accueil' },
  { to: '/plan', label: 'Plan 3D' },
]

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="text-lg font-semibold tracking-tight text-slate-950">
            CoWork'Space
          </Link>

          <button
            type="button"
            className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="main-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true">☰</span>
          </button>

          <nav
            id="main-nav"
            className={`${menuOpen ? 'flex' : 'hidden'} absolute top-16 right-0 left-0 flex-col gap-1 border-b border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-xl md:static md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none`}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-950'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 md:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">
        CoWork'Space · Réservation d'espaces de travail
      </footer>
    </div>
  )
}
