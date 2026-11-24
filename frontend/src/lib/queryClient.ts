import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'

/** Cache des données serveur partagé par toute l'application. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Inutile de réessayer une erreur client (401, 403, 404…).
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
})
