const DEFAULT_BASE_URL = "http://localhost:5000";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_BASE_URL;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${trimTrailingSlash(API_BASE_URL)}${normalizedPath}`;

  const headers = new Headers(options.headers);
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const payload = data as ApiErrorPayload;
    const message =
      payload?.message || payload?.error || res.statusText || "Request failed";
    throw new Error(message);
  }

  return data as T;
}
