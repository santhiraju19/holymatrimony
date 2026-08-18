import { getToken } from "@/lib/auth";

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

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8081/api/v1"
).replace(/\/$/, "");

const PHOTO_API_URL =
  `${API_BASE_URL}/profile/photos`;

function requireAccessToken(): string {
  const token = getToken();

  if (!token) {
    throw new Error(
      "Authentication token not found. Please log in again."
    );
  }

  return token;
}

function buildHeaders(
  contentType?: string
): HeadersInit {
  const token =
    requireAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  if (contentType) {
    headers["Content-Type"] =
      contentType;
  }

  return headers;
}

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

export function resolvePhotoUrl(
  imageUrl: string | null | undefined
): string {
  if (!imageUrl) {
    return "";
  }

  const trimmed =
    imageUrl.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    try {
      const url =
        new URL(trimmed);

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
          return `${window.location.origin}${staticPath}`;
        }

        return `${url.origin}${staticPath}`;
      }

      return trimmed;
    } catch {
      return trimmed;
    }
  }

  const normalizedPath =
    trimmed.startsWith("/")
      ? trimmed
      : `/${trimmed}`;

  if (
    normalizedPath.startsWith(
      "/api/v1/uploads/"
    )
  ) {
    const staticPath =
      normalizedPath.replace(
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

  if (
    normalizedPath.startsWith(
      "/uploads/"
    )
  ) {
    if (
      typeof window !==
      "undefined"
    ) {
      return `${window.location.origin}${normalizedPath}`;
    }

    return normalizedPath;
  }

  if (
    normalizedPath.startsWith(
      "/api/"
    )
  ) {
    const backendOrigin =
      API_BASE_URL.replace(
        /\/api\/v1$/,
        ""
      );

    return `${backendOrigin}${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

export async function getPhotos():
  Promise<ProfilePhotoResponse[]> {
  const response =
    await fetch(
      PHOTO_API_URL,
      {
        method: "GET",
        headers: buildHeaders(),
        cache: "no-store",
      }
    );

  await ensureSuccess(
    response
  );

  return response.json();
}

export async function uploadPhoto(
  file: File,
  options: UploadPhotoOptions = {}
): Promise<ProfilePhotoResponse> {
  return uploadWithXmlHttpRequest(
    file,
    options
  );
}

function uploadWithXmlHttpRequest(
  file: File,
  options: UploadPhotoOptions
): Promise<ProfilePhotoResponse> {
  return new Promise(
    (resolve, reject) => {
      let settled = false;

      let abortHandler:
        (() => void) | null =
        null;

      const finishResolve = (
        photo: ProfilePhotoResponse
      ) => {
        if (settled) {
          return;
        }

        settled = true;

        if (
          options.signal &&
          abortHandler
        ) {
          options.signal
            .removeEventListener(
              "abort",
              abortHandler
            );
        }

        resolve(photo);
      };

      const finishReject = (
        error: Error
      ) => {
        if (settled) {
          return;
        }

        settled = true;

        if (
          options.signal &&
          abortHandler
        ) {
          options.signal
            .removeEventListener(
              "abort",
              abortHandler
            );
        }

        reject(error);
      };

      const token =
        requireAccessToken();

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const xhr =
        new XMLHttpRequest();

      xhr.open(
        "POST",
        PHOTO_API_URL,
        true
      );

      xhr.setRequestHeader(
        "Authorization",
        `Bearer ${token}`
      );

      xhr.setRequestHeader(
        "Accept",
        "application/json"
      );

      xhr.upload.onprogress = (
        event
      ) => {
        if (
          !event.lengthComputable
        ) {
          return;
        }

        const percentage =
          Math.round(
            (
              event.loaded /
              event.total
            ) * 100
          );

        options.onProgress?.(
          Math.min(
            Math.max(
              percentage,
              0
            ),
            100
          )
        );
      };

      xhr.onload = () => {
        if (
          xhr.status >= 200 &&
          xhr.status < 300
        ) {
          try {
            const response =
              JSON.parse(
                xhr.responseText
              ) as ProfilePhotoResponse;

            options.onProgress?.(
              100
            );

            finishResolve(
              response
            );
          } catch {
            finishReject(
              new Error(
                "Photo uploaded, but the server response could not be read."
              )
            );
          }

          return;
        }

        finishReject(
          new Error(
            parseXmlHttpRequestError(
              xhr
            )
          )
        );
      };

      xhr.onerror = () => {
        finishReject(
          new Error(
            "Unable to upload the photo. Please check your connection and try again."
          )
        );
      };

      xhr.onabort = () => {
        finishReject(
          new Error(
            "Photo upload was cancelled."
          )
        );
      };

      xhr.ontimeout = () => {
        finishReject(
          new Error(
            "Photo upload timed out. Please try again."
          )
        );
      };

      abortHandler = () => {
        xhr.abort();
      };

      if (options.signal) {
        if (
          options.signal.aborted
        ) {
          finishReject(
            new Error(
              "Photo upload was cancelled."
            )
          );

          return;
        }

        options.signal
          .addEventListener(
            "abort",
            abortHandler,
            {
              once: true,
            }
          );
      }

      xhr.send(
        formData
      );
    }
  );
}

export async function deletePhoto(
  id: string
): Promise<void> {
  const response =
    await fetch(
      `${PHOTO_API_URL}/${id}`,
      {
        method: "DELETE",
        headers: buildHeaders(),
        cache: "no-store",
      }
    );

  await ensureSuccess(
    response
  );
}

export async function setPrimaryPhoto(
  id: string
): Promise<ProfilePhotoResponse> {
  const response =
    await fetch(
      `${PHOTO_API_URL}/${id}/primary`,
      {
        method: "PUT",
        headers: buildHeaders(),
        cache: "no-store",
      }
    );

  await ensureSuccess(
    response
  );

  return response.json();
}

export async function reorderPhotos(
  photoIds: string[]
): Promise<ProfilePhotoResponse[]> {
  const request:
    PhotoOrderRequest = {
    photoIds,
  };

  const response =
    await fetch(
      `${PHOTO_API_URL}/order`,
      {
        method: "PUT",
        headers: buildHeaders(
          "application/json"
        ),
        body: JSON.stringify(
          request
        ),
        cache: "no-store",
      }
    );

  await ensureSuccess(
    response
  );

  return response.json();
}

function parseXmlHttpRequestError(
  xhr: XMLHttpRequest
): string {
  if (!xhr.responseText) {
    return `Photo upload failed with status ${xhr.status}.`;
  }

  try {
    const data =
      JSON.parse(
        xhr.responseText
      ) as {
        message?: string;
        error?: string;
      };

    return (
      data.message ??
      data.error ??
      `Photo upload failed with status ${xhr.status}.`
    );
  } catch {
    return `Photo upload failed with status ${xhr.status}.`;
  }
}
