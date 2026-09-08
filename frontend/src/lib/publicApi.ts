import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8080/api/v1";

/**
 * API client for endpoints that are intentionally public.
 *
 * Important:
 * - Does not attach an access token.
 * - Does not attempt token refresh.
 * - Does not redirect anonymous visitors to /login.
 *
 * Keep authenticated application requests on "@/lib/api".
 */
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

export default publicApi;
