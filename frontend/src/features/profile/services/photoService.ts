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
  const token = requireAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
}

async function parseErrorResponse(
  response: Response
): Promise<string> {
  try {
    const data = (await response.json()) as {
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
    await parseErrorResponse(response);

  throw new Error(message);
}

export function resolvePhotoUrl(
  imageUrl: string
): string {
  if (!imageUrl) {
    return "";
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("blob:")
  ) {
    return imageUrl;
  }

  const normalizedPath =
    imageUrl.startsWith("/")
      ? imageUrl
      : `/${imageUrl}`;

  /*
   * If the backend returns /api/v1/profile/photos/...
   * use the backend origin only.
   */
  if (normalizedPath.startsWith("/api/")) {
    const backendOrigin =
      API_BASE_URL.replace(/\/api\/v1$/, "");

    return `${backendOrigin}${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

export async function getPhotos(): Promise<
  ProfilePhotoResponse[]
> {
  const response = await fetch(
    PHOTO_API_URL,
    {
      method: "GET",
      headers: buildHeaders(),
      cache: "no-store",
    }
  );

  await ensureSuccess(response);

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
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();

    let token: string;

    try {
      token = requireAccessToken();
    } catch (error) {
      reject(error);
      return;
    }

    formData.append("file", file);

    request.open(
      "POST",
      PHOTO_API_URL,
      true
    );

    request.setRequestHeader(
      "Authorization",
      `Bearer ${token}`
    );

    request.setRequestHeader(
      "Accept",
      "application/json"
    );

    request.upload.onprogress = (
      event: ProgressEvent
    ) => {
      if (
        !event.lengthComputable ||
        !options.onProgress
      ) {
        return;
      }

      const percentage = Math.round(
        (event.loaded / event.total) * 100
      );

      options.onProgress(percentage);
    };

    request.onload = () => {
      if (
        request.status >= 200 &&
        request.status < 300
      ) {
        try {
          const response = JSON.parse(
            request.responseText
          ) as ProfilePhotoResponse;

          options.onProgress?.(100);
          resolve(response);
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
          extractXmlHttpRequestError(request)
        )
      );
    };

    request.onerror = () => {
      reject(
        new Error(
          "Unable to connect to the photo upload service."
        )
      );
    };

    request.onabort = () => {
      reject(
        new DOMException(
          "Photo upload was cancelled.",
          "AbortError"
        )
      );
    };

    if (options.signal) {
      if (options.signal.aborted) {
        request.abort();
        return;
      }

      options.signal.addEventListener(
        "abort",
        () => request.abort(),
        { once: true }
      );
    }

    request.send(formData);
  });
}

function extractXmlHttpRequestError(
  request: XMLHttpRequest
): string {
  try {
    const data = JSON.parse(
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

export async function deletePhoto(
  photoId: string
): Promise<void> {
  const response = await fetch(
    `${PHOTO_API_URL}/${photoId}`,
    {
      method: "DELETE",
      headers: buildHeaders(),
    }
  );

  await ensureSuccess(response);
}

export async function setPrimaryPhoto(
  photoId: string
): Promise<ProfilePhotoResponse> {
  const response = await fetch(
    `${PHOTO_API_URL}/${photoId}/primary`,
    {
      method: "PUT",
      headers: buildHeaders(),
    }
  );

  await ensureSuccess(response);

  return response.json();
}

export async function reorderPhotos(
  photoIds: string[]
): Promise<ProfilePhotoResponse[]> {
  const requestBody: PhotoOrderRequest = {
    photoIds,
  };

  const response = await fetch(
    `${PHOTO_API_URL}/order`,
    {
      method: "PUT",
      headers: buildHeaders(
        "application/json"
      ),
      body: JSON.stringify(requestBody),
    }
  );

  await ensureSuccess(response);

  return response.json();
}