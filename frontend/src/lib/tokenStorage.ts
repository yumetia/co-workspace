const TOKEN_KEY = 'coworkspace.token'

/** Stockage du jeton JWT de l'utilisateur connecté. */
export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
}
