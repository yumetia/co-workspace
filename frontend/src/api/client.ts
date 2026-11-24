import { tokenStorage } from '../lib/tokenStorage'

/** Erreur renvoyée par l'API au format ProblemDetail (RFC 9457). */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type ProblemDetail = {
  detail?: string
  title?: string
  errors?: Record<string, string>
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  /** Objet sérialisé en JSON, ou FormData envoyé tel quel (upload de fichier). */
  body?: unknown
}

/**
 * Appelle l'API REST : ajoute le jeton JWT, sérialise le corps en JSON
 * et transforme les réponses d'erreur en {@link ApiError}.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options
  const finalHeaders = new Headers(headers)
  finalHeaders.set('Accept', 'application/json')

  const token = tokenStorage.get()
  if (token) {
    finalHeaders.set('Authorization', `Bearer ${token}`)
  }

  let finalBody: BodyInit | undefined
  if (body instanceof FormData) {
    finalBody = body
  } else if (body !== undefined) {
    finalHeaders.set('Content-Type', 'application/json')
    finalBody = JSON.stringify(body)
  }

  const response = await fetch(path, { ...rest, headers: finalHeaders, body: finalBody })

  if (!response.ok) {
    throw await toApiError(response)
  }
  if (response.status === 204) {
    return undefined as T
  }
  const contentType = response.headers.get('Content-Type') ?? ''
  return (contentType.includes('json') ? response.json() : response.text()) as Promise<T>
}

async function toApiError(response: Response): Promise<ApiError> {
  let problem: ProblemDetail = {}
  try {
    problem = (await response.json()) as ProblemDetail
  } catch {
    // Corps vide ou non JSON : on garde le message par défaut.
  }
  const message = problem.detail ?? defaultMessage(response.status)
  return new ApiError(response.status, message, problem.errors ?? {})
}

function defaultMessage(status: number): string {
  if (status === 401) return 'Votre session a expiré, veuillez vous reconnecter.'
  if (status === 403) return "Vous n'avez pas les droits pour effectuer cette action."
  if (status >= 500) return 'Le serveur rencontre un problème, réessayez plus tard.'
  return 'La requête a échoué.'
}
