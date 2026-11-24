import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/renderWithProviders'
import { AppLayout } from './AppLayout'

describe('AppLayout', () => {
  const routes = [
    { path: '/', element: <AppLayout />, children: [{ index: true, element: <p>Contenu</p> }] },
  ]

  it('affiche le logo, la navigation et le contenu de la page', () => {
    renderWithProviders(routes)

    expect(screen.getByRole('link', { name: "CoWork'Space" })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Accueil' })).toBeInTheDocument()
    expect(screen.getByText('Contenu')).toBeInTheDocument()
  })

  it('ouvre le menu sur mobile', async () => {
    renderWithProviders(routes)
    const button = screen.getByRole('button', { name: 'Ouvrir le menu' })

    await userEvent.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
  })
})
