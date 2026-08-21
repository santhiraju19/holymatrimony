

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1";

/**
 * Returns the backend origin without /api/v1.
 *
 * Examples:
 *
 * http://localhost:8080/api/v1
 * ->
 * http://localhost:8080
 *
 * https://www.theholymatrimony.com/api/v1
 * ->
 * https://www.theholymatrimony.com
 */
function getBackendOrigin(): string {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "http://localhost:8080";
  }
}

/**
 * Resolve profile-photo URLs returned by the browse/profile APIs.
 *
 * Current photo storage URL:
 *
 *   /uploads/profile-photos/photo.jpg
 *
 * Historical records may contain:
 *
 *   /api/v1/uploads/profile-photos/photo.jpg
 *
 * Profile photos are served from:
 *
 *   /uploads/**
 *
 * NOT:
 *
 *   /api/v1/uploads/**
 *
 * This resolver deliberately keeps image delivery separate from the
 * REST API base path.
 */
export function resolveBrowsePhotoUrl(
  photoUrl: string | null | undefined
): string {
  if (!photoUrl) {
    return "";
  }

  let value = photoUrl.trim();

  if (!value) {
    return "";
  }

  /*
   * Browser-local preview URLs.
   */
  if (
    value.startsWith("blob:") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  const backendOrigin =
    getBackendOrigin();

  /*
   * ============================================================
   * CURRENT STORED FORMAT
   * ============================================================
   *
   * /uploads/profile-photos/photo.jpg
   */
  if (
    value.startsWith("/uploads/")
  ) {
    /*
     * Development:
     *
     * http://localhost:8080/uploads/...
     */
    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      return `${backendOrigin}${value}`;
    }

    /*
     * Production:
     *
     * Prefer the current website origin because Nginx serves
     * /uploads/** directly.
     */
    if (
      typeof window !==
      "undefined"
    ) {
      return `${window.location.origin}${value}`;
    }

    return `${backendOrigin}${value}`;
  }

  /*
   * ============================================================
   * HISTORICAL STORED FORMAT
   * ============================================================
   *
   * /api/v1/uploads/profile-photos/photo.jpg
   *
   * Convert it to:
   *
   * /uploads/profile-photos/photo.jpg
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
      process.env.NODE_ENV ===
      "development"
    ) {
      return `${backendOrigin}${staticPath}`;
    }

    if (
      typeof window !==
      "undefined"
    ) {
      return `${window.location.origin}${staticPath}`;
    }

    return `${backendOrigin}${staticPath}`;
  }

  /*
   * ============================================================
   * ABSOLUTE URL
   * ============================================================
   */
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    try {
      const url =
        new URL(value);

      /*
       * Historical absolute API upload URL:
       *
       * http://localhost:8080/api/v1/uploads/...
       *
       * ->
       *
       * http://localhost:8080/uploads/...
       */
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

        if (
          process.env.NODE_ENV ===
          "development"
        ) {
          return (
            `${backendOrigin}` +
            `${staticPath}` +
            `${url.search}`
          );
        }

        if (
          typeof window !==
          "undefined"
        ) {
          return (
            `${window.location.origin}` +
            `${staticPath}` +
            `${url.search}`
          );
        }

        return (
          `${url.origin}` +
          `${staticPath}` +
          `${url.search}`
        );
      }

      /*
       * Development repair.
       *
       * Sometimes an upload URL may have been generated using
       * the frontend origin:
       *
       * http://localhost:3000/uploads/...
       *
       * Convert it to:
       *
       * http://localhost:8080/uploads/...
       */
      if (
        process.env.NODE_ENV ===
          "development" &&
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
        return (
          `${backendOrigin}` +
          `${url.pathname}` +
          `${url.search}`
        );
      }

      return value;
    } catch {
      return value;
    }
  }

  /*
   * Normalize relative value.
   */
  if (
    !value.startsWith("/")
  ) {
    value = `/${value}`;
  }

  /*
   * Other REST API resources still use the API/backend origin.
   */
  if (
    value.startsWith("/api/")
  ) {
    return `${backendOrigin}${value}`;
  }

  /*
   * Unknown relative resource.
   */
  return `${backendOrigin}${value}`;
}
