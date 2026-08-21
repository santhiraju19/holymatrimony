import { getToken } from "@/lib/auth";

/*
 * ============================================================
 * TYPES
 * ============================================================
 */

export interface ProfilePhotoResponse {
  id: string;
  fileName: string;
  imageUrl: string;
  contentType: string;
  fileSize: number;
  primaryPhoto: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface UploadPhotoOptions {
  onProgress?: (percentage: number) => void;
  signal?: AbortSignal;
}

interface PhotoOrderRequest {
  photoIds: string[];
}

/*
 * ============================================================
 * API CONFIG
 * ============================================================
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1"
).replace(/\/$/, "");

const PHOTO_API_URL =
  `${API_BASE_URL}/profile/photos`;

/*
 * ============================================================
 * AUTH
 * ============================================================
 */

function requireAccessToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Authentication token not found. Please log in again."
    );
  }

  return token;
}

/*
 * ============================================================
 * HEADERS
 * ============================================================
 */

function buildHeaders(
  contentType?: string
): HeadersInit {
  const token =
    requireAccessToken();

  const headers: Record<
    string,
    string
  > = {
    Authorization:
      `Bearer ${token}`,
    Accept:
      "application/json",
  };

  if (contentType) {
    headers["Content-Type"] =
      contentType;
  }

  return headers;
}

/*
 * ============================================================
 * ERROR HANDLING
 * ============================================================
 */

async function parseErrorResponse(
  response: Response
): Promise<string> {
  try {
    const data =
      (await response.json()) as {
        message?: string;
        error?: string;
      };

    return (
      data.message ??
      data.error ??
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

async function ensureSuccess(
  response: Response
): Promise<Response> {
  if (response.ok) {
    return response;
  }

  const message =
    await parseErrorResponse(
      response
    );

  throw new Error(message);
}

/*
 * ============================================================
 * BACKEND ORIGIN
 * ============================================================
 *
 * NEXT_PUBLIC_API_URL:
 *
 *   http://localhost:8080/api/v1
 *
 * Upload files themselves are served from:
 *
 *   http://localhost:8080/uploads/...
 *
 * so we need the backend origin without /api/v1.
 */

function getBackendOrigin(): string {
  try {
    return new URL(
      API_BASE_URL
    ).origin;
  } catch {
    return "http://localhost:8080";
  }
}

/*
 * ============================================================
 * PHOTO URL RESOLVER
 * ============================================================
 *
 * Supported backend/database formats:
 *
 *   /uploads/profile-photos/photo.jpg
 *
 *   /api/v1/uploads/profile-photos/photo.jpg
 *
 *   http://localhost:3000/uploads/profile-photos/photo.jpg
 *
 *   http://localhost:8080/uploads/profile-photos/photo.jpg
 *
 *   https://www.theholymatrimony.com/uploads/profile-photos/photo.jpg
 *
 *
 * LOCAL:
 *
 * Next.js:
 *   http://localhost:3000
 *
 * Backend:
 *   http://localhost:8080
 *
 * Actual static upload route:
 *   http://localhost:8080/uploads/...
 *
 *
 * PRODUCTION:
 *
 * Nginx directly serves:
 *   https://www.theholymatrimony.com/uploads/...
 */

export function resolvePhotoUrl(
  imageUrl:
    | string
    | null
    | undefined
): string {
  if (!imageUrl) {
    return "";
  }

  let value =
    imageUrl.trim();

  if (!value) {
    return "";
  }

  /*
   * Local browser preview.
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
   * ==========================================================
   * LOCAL DEVELOPMENT
   * ==========================================================
   */

  if (
    process.env.NODE_ENV ===
    "development"
  ) {
    /*
     * Current stored format:
     *
     * /uploads/profile-photos/a.jpg
     *
     * ->
     *
     * http://localhost:8080/uploads/profile-photos/a.jpg
     */

    if (
      value.startsWith(
        "/uploads/"
      )
    ) {
      return `${backendOrigin}${value}`;
    }

    /*
     * Historical format:
     *
     * /api/v1/uploads/profile-photos/a.jpg
     *
     * The actual static resource handler is /uploads/**.
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

      return `${backendOrigin}${staticPath}`;
    }

    /*
     * Handle absolute URLs.
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

        const isLocalHost =
          url.hostname ===
            "localhost" ||
          url.hostname ===
            "127.0.0.1";

        /*
         * Repair:
         *
         * http://localhost:3000/uploads/...
         *
         * ->
         *
         * http://localhost:8080/uploads/...
         */

        if (
          isLocalHost &&
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

        /*
         * Repair historical:
         *
         * http://localhost:8080/api/v1/uploads/...
         *
         * ->
         *
         * http://localhost:8080/uploads/...
         */

        if (
          isLocalHost &&
          url.pathname.startsWith(
            "/api/v1/uploads/"
          )
        ) {
          const staticPath =
            url.pathname.replace(
              "/api/v1/uploads/",
              "/uploads/"
            );

          return (
            `${backendOrigin}` +
            `${staticPath}` +
            `${url.search}`
          );
        }

        /*
         * Other external absolute URL.
         */

        return value;
      } catch {
        /*
         * Continue with relative
         * path handling below.
         */
      }
    }
  }

  /*
   * ==========================================================
   * ABSOLUTE PRODUCTION URL
   * ==========================================================
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

      /*
       * Historical backend URL:
       *
       * https://www.theholymatrimony.com/api/v1/uploads/...
       *
       * ->
       *
       * https://www.theholymatrimony.com/uploads/...
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
   * ==========================================================
   * HISTORICAL API UPLOAD PATH
   * ==========================================================
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
      return (
        `${window.location.origin}` +
        `${staticPath}`
      );
    }

    return staticPath;
  }

  /*
   * ==========================================================
   * CURRENT STATIC UPLOAD PATH
   * ==========================================================
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
      return (
        `${window.location.origin}` +
        `${value}`
      );
    }

    return value;
  }

  /*
   * ==========================================================
   * OTHER API PATH
   * ==========================================================
   */

  if (
    value.startsWith(
      "/api/"
    )
  ) {
    return `${backendOrigin}${value}`;
  }

  /*
   * Other relative backend resource.
   */

  return `${API_BASE_URL}${value}`;
}

/*
 * ============================================================
 * GET PHOTOS
 * ============================================================
 */

export async function getPhotos():
  Promise<
    ProfilePhotoResponse[]
  > {
  const response =
    await fetch(
      PHOTO_API_URL,
      {
        method:
          "GET",

        headers:
          buildHeaders(),

        credentials:
          "include",

        cache:
          "no-store",
      }
    );

  await ensureSuccess(
    response
  );

  return (
    await response.json()
  ) as ProfilePhotoResponse[];
}

/*
 * ============================================================
 * UPLOAD PHOTO
 * ============================================================
 */

export async function uploadPhoto(
  file: File,
  options:
    UploadPhotoOptions = {}
): Promise<ProfilePhotoResponse> {
  return uploadWithXmlHttpRequest(
    file,
    options
  );
}

/*
 * XMLHttpRequest is used because fetch does not provide
 * reliable browser upload progress events.
 */

function uploadWithXmlHttpRequest(
  file: File,
  options:
    UploadPhotoOptions
): Promise<ProfilePhotoResponse> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const request =
        new XMLHttpRequest();

      const formData =
        new FormData();

      let token: string;

      try {
        token =
          requireAccessToken();
      } catch (
        error: unknown
      ) {
        reject(error);

        return;
      }

      formData.append(
        "file",
        file
      );

      request.open(
        "POST",
        PHOTO_API_URL,
        true
      );

      request.withCredentials =
        true;

      request.setRequestHeader(
        "Authorization",
        `Bearer ${token}`
      );

      request.setRequestHeader(
        "Accept",
        "application/json"
      );

      /*
       * ========================================================
       * UPLOAD PROGRESS
       * ========================================================
       */

      request.upload.onprogress =
        (
          event:
            ProgressEvent<EventTarget>
        ) => {
          if (
            !event.lengthComputable ||
            !options.onProgress
          ) {
            return;
          }

          const percentage =
            Math.round(
              (
                event.loaded /
                event.total
              ) *
                100
            );

          options.onProgress(
            percentage
          );
        };

      /*
       * ========================================================
       * COMPLETE
       * ========================================================
       */

      request.onload =
        () => {
          if (
            request.status >=
              200 &&
            request.status <
              300
          ) {
            try {
              const response =
                JSON.parse(
                  request.responseText
                ) as
                  ProfilePhotoResponse;

              options
                .onProgress?.(
                  100
                );

              resolve(
                response
              );
            } catch {
              reject(
                new Error(
                  "The photo upload response was invalid."
                )
              );
            }

            return;
          }

          reject(
            new Error(
              extractXmlHttpRequestError(
                request
              )
            )
          );
        };

      /*
       * ========================================================
       * NETWORK ERROR
       * ========================================================
       */

      request.onerror =
        () => {
          reject(
            new Error(
              "Unable to connect to the photo upload service."
            )
          );
        };

      /*
       * ========================================================
       * CANCELLED
       * ========================================================
       */

      request.onabort =
        () => {
          reject(
            new DOMException(
              "Photo upload was cancelled.",
              "AbortError"
            )
          );
        };

      /*
       * ========================================================
       * ABORT SIGNAL
       * ========================================================
       */

      if (
        options.signal
      ) {
        if (
          options.signal
            .aborted
        ) {
          request.abort();

          return;
        }

        options.signal
          .addEventListener(
            "abort",
            () =>
              request.abort(),
            {
              once: true,
            }
          );
      }

      request.send(
        formData
      );
    }
  );
}

/*
 * ============================================================
 * XHR ERROR
 * ============================================================
 */

function extractXmlHttpRequestError(
  request: XMLHttpRequest
): string {
  try {
    const data =
      JSON.parse(
        request.responseText
      ) as {
        message?: string;
        error?: string;
      };

    return (
      data.message ??
      data.error ??
      `Upload failed with status ${request.status}`
    );
  } catch {
    return `Upload failed with status ${request.status}`;
  }
}

/*
 * ============================================================
 * DELETE PHOTO
 * ============================================================
 */

export async function deletePhoto(
  photoId: string
): Promise<void> {
  const response =
    await fetch(
      `${PHOTO_API_URL}/${photoId}`,
      {
        method:
          "DELETE",

        headers:
          buildHeaders(),

        credentials:
          "include",
      }
    );

  await ensureSuccess(
    response
  );
}

/*
 * ============================================================
 * SET PRIMARY PHOTO
 * ============================================================
 */

export async function setPrimaryPhoto(
  photoId: string
): Promise<ProfilePhotoResponse> {
  const response =
    await fetch(
      `${PHOTO_API_URL}/${photoId}/primary`,
      {
        method:
          "PUT",

        headers:
          buildHeaders(),

        credentials:
          "include",
      }
    );

  await ensureSuccess(
    response
  );

  return (
    await response.json()
  ) as ProfilePhotoResponse;
}

/*
 * ============================================================
 * REORDER PHOTOS
 * ============================================================
 */

export async function reorderPhotos(
  photoIds: string[]
): Promise<
  ProfilePhotoResponse[]
> {
  const requestBody:
    PhotoOrderRequest = {
      photoIds,
    };

  const response =
    await fetch(
      `${PHOTO_API_URL}/order`,
      {
        method:
          "PUT",

        headers:
          buildHeaders(
            "application/json"
          ),

        credentials:
          "include",

        body:
          JSON.stringify(
            requestBody
          ),
      }
    );

  await ensureSuccess(
    response
  );

  return (
    await response.json()
  ) as ProfilePhotoResponse[];
}