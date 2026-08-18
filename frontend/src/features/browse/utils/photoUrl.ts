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

/**
 * Converts profile-photo paths returned by the backend into the
 * fastest public URL available.
 *
 * Historical database records may contain:
 *
 *   /api/v1/uploads/profile-photos/photo.jpg
 *
 * Production Nginx serves those files directly from:
 *
 *   /uploads/profile-photos/photo.jpg
 *
 * Using the static route avoids sending every image request through
 * Spring Boot and allows Nginx/browser caching to work efficiently.
 */
export function resolveBrowsePhotoUrl(
  photoUrl: string | null | undefined
): string {
  if (!photoUrl) {
    return "";
  }

  if (
    photoUrl.startsWith("blob:") ||
    photoUrl.startsWith("data:")
  ) {
    return photoUrl;
  }

  let value = photoUrl.trim();

  /*
   * Absolute URLs may also contain the historical API upload path.
   */
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    try {
      const url = new URL(value);

      if (
        url.pathname.startsWith(
          "/api/v1/uploads/"
        )
      ) {
        const staticPath =
          url.pathname.replace(
            "/api/v1/uploads/",
            "/uploads/"
          );

        /*
         * In the browser, use the current public website origin.
         * This keeps images on the same host as the frontend.
         */
        if (typeof window !== "undefined") {
          return `${window.location.origin}${staticPath}`;
        }

        return `${url.origin}${staticPath}`;
      }

      return value;
    } catch {
      return value;
    }
  }

  if (!value.startsWith("/")) {
    value = `/${value}`;
  }

  /*
   * Convert legacy API upload URLs to the Nginx static route.
   */
  if (
    value.startsWith(
      "/api/v1/uploads/"
    )
  ) {
    const staticPath =
      value.replace(
        "/api/v1/uploads/",
        "/uploads/"
      );

    if (typeof window !== "undefined") {
      return `${window.location.origin}${staticPath}`;
    }

    return staticPath;
  }

  /*
   * Already a public static upload URL.
   */
  if (value.startsWith("/uploads/")) {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${value}`;
    }

    return value;
  }

  /*
   * Other API resources continue to use the backend.
   */
  if (value.startsWith("/api/")) {
    return `${getBackendOrigin()}${value}`;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}${value}`;
}
