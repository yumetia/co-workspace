import { createBrowserRouter } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { HomePage } from '../features/home/HomePage'
import { ErrorPage } from './ErrorPage'
import { NotFoundPage } from './NotFoundPage'

/**
 * Routes de l'application.
 * Chaque module (auth, plan, réservations, admin…) ajoutera ses routes ici.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
