
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1";

function getBackendOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "http://localhost:8080";
  }
}

export function resolveBrowsePhotoUrl(
  photoUrl: string | null | undefined
): string {
  if (!photoUrl) {
    return "";
  }

  if (
    photoUrl.startsWith("http://") ||
    photoUrl.startsWith("https://") ||
    photoUrl.startsWith("blob:") ||
    photoUrl.startsWith("data:")
  ) {
    return photoUrl;
  }

  const normalizedPath = photoUrl.startsWith("/")
    ? photoUrl
    : `/${photoUrl}`;

  if (normalizedPath.startsWith("/api/")) {
    return `${getBackendOrigin()}${normalizedPath}`;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
}