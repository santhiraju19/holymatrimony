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
 * Production:
 *
 * Historical database records may contain:
 *
 *   /api/v1/uploads/profile-photos/photo.jpg
 *
 * Production Nginx serves those files directly from:
 *
 *   /uploads/profile-photos/photo.jpg
 *
 * Using the static route avoids sending every image request
 * through Spring Boot and allows Nginx/browser caching.
 *
 * Local development:
 *
 * Next.js does not serve /uploads directly, so those paths are
 * routed through the Spring Boot upload endpoint instead.
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

  let value =
    photoUrl.trim();

  if (!value) {
    return "";
  }

  /*
   * ============================================================
   * LOCAL DEVELOPMENT
   * ============================================================
   *
   * Production behavior below remains unchanged.
   */
  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    const apiBaseUrl =
      API_BASE_URL.replace(
        /\/$/,
        ""
      );

    /*
     * Public upload path:
     *
     * /uploads/profile-photos/a.jpg
     *
     * becomes:
     *
     * http://localhost:8080/api/v1/uploads/profile-photos/a.jpg
     */
    if (
      value.startsWith(
        "/uploads/"
      )
    ) {
      return `${apiBaseUrl}${value}`;
    }

    /*
     * Historical API path:
     *
     * /api/v1/uploads/profile-photos/a.jpg
     *
     * becomes:
     *
     * http://localhost:8080/api/v1/uploads/profile-photos/a.jpg
     */
    if (
      value.startsWith(
        "/api/v1/uploads/"
      )
    ) {
      return `${getBackendOrigin()}${value}`;
    }

    /*
     * Handle URLs that were previously rewritten to the
     * local Next.js frontend.
     *
     * http://localhost:3000/uploads/...
     *
     * becomes:
     *
     * http://localhost:8080/api/v1/uploads/...
     */
    try {
      const url =
        new URL(value);

      if (
        (
          url.hostname ===
            "localhost" ||
          url.hostname ===
            "127.0.0.1"
        ) &&
        url.pathname.startsWith(
          "/uploads/"
        )
      ) {
        return `${apiBaseUrl}${url.pathname}${url.search}`;
      }

      /*
       * Already pointing to the local backend.
       */
      if (
        (
          url.hostname ===
            "localhost" ||
          url.hostname ===
            "127.0.0.1"
        ) &&
        url.pathname.startsWith(
          "/api/v1/uploads/"
        )
      ) {
        return value;
      }
    } catch {
      /*
       * Not an absolute URL.
       * Continue with the normal production resolver.
       */
    }
  }

  /*
   * ============================================================
   * PRODUCTION / NORMAL RESOLUTION
   * ============================================================
   */

  /*
   * Absolute URLs may contain the historical API upload path.
   */
  if (
    value.startsWith(
      "http://"
    ) ||
    value.startsWith(
      "https://"
    )
  ) {
    try {
      const url =
        new URL(value);

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
         * Browser: use the current public website origin.
         *
         * This preserves the existing production Nginx
         * static-photo delivery path.
         */
        if (
          typeof window !==
          "undefined"
        ) {
          return `${window.location.origin}${staticPath}`;
        }

        return `${url.origin}${staticPath}`;
      }

      return value;
    } catch {
      return value;
    }
  }

  /*
   * Normalize relative paths.
   */
  if (
    !value.startsWith("/")
  ) {
    value =
      `/${value}`;
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

    if (
      typeof window !==
      "undefined"
    ) {
      return `${window.location.origin}${staticPath}`;
    }

    return staticPath;
  }

  /*
   * Already a public static upload URL.
   */
  if (
    value.startsWith(
      "/uploads/"
    )
  ) {
    if (
      typeof window !==
      "undefined"
    ) {
      return `${window.location.origin}${value}`;
    }

    return value;
  }

  /*
   * Other API resources continue to use the backend.
   */
  if (
    value.startsWith(
      "/api/"
    )
  ) {
    return `${getBackendOrigin()}${value}`;
  }

  return `${API_BASE_URL.replace(
    /\/$/,
    ""
  )}${value}`;
}