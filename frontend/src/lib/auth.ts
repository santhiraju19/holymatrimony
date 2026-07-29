const TOKEN_KEY = "hm_access_token";
const USER_KEY = "hm_user";

export interface StoredAuthUser {
  id?: string;
  fullName?: string;
  email: string;
  role?: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function setToken(token: string): void {
  if (!isBrowser()) return;

  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (!isBrowser()) return null;

  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(TOKEN_KEY);
}

export function setStoredUser(user: StoredAuthUser): void {
  if (!isBrowser()) return;

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): StoredAuthUser | null {
  if (!isBrowser()) return null;

  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as StoredAuthUser;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function removeStoredUser(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(USER_KEY);
}

export function clearAuthStorage(): void {
  removeToken();
  removeStoredUser();
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export const AUTH_STORAGE_KEYS = {
  token: TOKEN_KEY,
  user: USER_KEY,
} as const;