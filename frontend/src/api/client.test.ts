import { afterEach, describe, expect, it, vi } from 'vitest'
import { tokenStorage } from '../lib/tokenStorage'
import { ApiError, apiFetch } from './client'

function mockFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('apiFetch', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('envoie le corps en JSON et renvoie la réponse décodée', async () => {
    const fetchMock = mockFetch(json({ id: 1 }))

    const result = await apiFetch<{ id: number }>('/api/test', { method: 'POST', body: { a: 1 } })

    expect(result).toEqual({ id: 1 })
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(init.body).toBe('{"a":1}')
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json')
  })

  it("ajoute le jeton JWT quand l'utilisateur est connecté", async () => {
    tokenStorage.set('abc')
    const fetchMock = mockFetch(json({}))

    await apiFetch('/api/test')

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer abc')
  })

  it('transforme une réponse ProblemDetail en ApiError', async () => {
    mockFetch(
      json({ detail: 'Certains champs sont invalides.', errors: { email: 'Email invalide' } }, 400),
    )

    const error = await apiFetch('/api/test').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 400,
      message: 'Certains champs sont invalides.',
      fieldErrors: { email: 'Email invalide' },
    })
  })

  it('utilise un message par défaut si le corps est vide', async () => {
    mockFetch(new Response(null, { status: 401 }))

    await expect(apiFetch('/api/test')).rejects.toThrow('Votre session a expiré')
  })
})
