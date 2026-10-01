interface CacheItem<T> {
  timestamp: number;
  data: T;
}

const memoryCache = new Map<string, CacheItem<unknown>>();

export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  cacheMaxAgeMs?: number;
  useLocalStorage?: boolean;
}

export async function fetchWithCacheAndTimeout<T>(
  url: string,
  options: FetchOptions = {}
): Promise<{ data: T | null; fromCache: boolean; error?: string }> {
  const {
    timeoutMs = 5000,
    cacheMaxAgeMs = 15 * 60 * 1000, // Default 15 mins
    useLocalStorage = true,
    ...fetchInit
  } = options;

  const cacheKey = `wastewise_api_cache_${url}`;

  // 1. Check in-memory cache
  const memCached = memoryCache.get(cacheKey) as CacheItem<T> | undefined;
  if (memCached && Date.now() - memCached.timestamp < cacheMaxAgeMs) {
    return { data: memCached.data, fromCache: true };
  }

  // 2. Check localStorage cache
  if (useLocalStorage && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const parsed: CacheItem<T> = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < cacheMaxAgeMs) {
          memoryCache.set(cacheKey, parsed);
          return { data: parsed.data, fromCache: true };
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  // 3. Fetch from API with timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchInit,
      signal: controller.signal
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data: T = await response.json();

    // Cache the successful response
    const cacheEntry: CacheItem<T> = { timestamp: Date.now(), data };
    memoryCache.set(cacheKey, cacheEntry);
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      } catch {
        // Ignore localStorage quota errors
      }
    }

    return { data, fromCache: false };
  } catch (err: unknown) {
    clearTimeout(id);
    const errorMsg = err instanceof Error ? err.message : String(err);

    // If fetch failed, return expired localStorage cache if available
    if (useLocalStorage && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          const parsed: CacheItem<T> = JSON.parse(stored);
          return { data: parsed.data, fromCache: true, error: `Fallback to cached data: ${errorMsg}` };
        }
      } catch {
        // Ignore
      }
    }

    return { data: null, fromCache: false, error: errorMsg };
  }
}
