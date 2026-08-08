import {
  clearAuthStorage,
  getToken,
} from "@/lib/auth";

interface JwtPayload {
  sub?: string;
  authorities?: string[];
  exp?: number;
}

function decodeJwtPayload(
  token: string
): JwtPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded =
      payload +
      "=".repeat(
        (4 - (payload.length % 4)) % 4
      );

    const decoded = atob(padded);

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isAdminToken(
  token: string | null
): boolean {
  if (!token) {
    return false;
  }

  const payload =
    decodeJwtPayload(token);

  if (!payload) {
    return false;
  }

  if (
    payload.exp &&
    payload.exp * 1000 <= Date.now()
  ) {
    return false;
  }

  return Boolean(
    payload.authorities?.includes(
      "ROLE_ADMIN"
    )
  );
}

export function hasAdminSession(): boolean {
  return isAdminToken(
    getToken()
  );
}

export function clearInvalidAdminSession(): void {
  clearAuthStorage();
}