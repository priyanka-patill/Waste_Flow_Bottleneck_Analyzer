const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export async function fetchFromBackend<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs: number = 3000
): Promise<{ data: T | null; isBackendLive: boolean; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${BACKEND_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!response.ok) {
      return { data: null, isBackendLive: false, error: `HTTP ${response.status}` };
    }

    const json = await response.json();
    if (json.success !== undefined) {
      return { data: json.data as T, isBackendLive: true };
    }
    return { data: json as T, isBackendLive: true };
  } catch (err: unknown) {
    clearTimeout(timer);
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { data: null, isBackendLive: false, error: errorMsg };
  }
}
