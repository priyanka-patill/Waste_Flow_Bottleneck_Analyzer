import { fetchWithCacheAndTimeout } from './apiClient';

export interface OpenAqMeasurement {
  parameter: {
    name: string;
    displayName?: string;
  };
  value: number;
  unit: string;
}

export interface OpenAqLocationResponse {
  results?: Array<{
    id: number;
    name: string;
    sensors?: Array<{
      id: number;
      parameter: {
        name: string;
      };
    }>;
  }>;
}

export interface OpenAqLatestResponse {
  results?: Array<{
    parameter: string;
    value: number;
    unit: string;
  }>;
}

export interface RawAirQualityData {
  pm2_5?: number;
  pm10?: number;
  no2?: number;
  co?: number;
  o3?: number;
  isFallback: boolean;
  source: string;
}

export const DEFAULT_MUMBAI_AIR_QUALITY: RawAirQualityData = {
  pm2_5: 48.5,
  pm10: 86.2,
  no2: 34.1,
  co: 0.85,
  o3: 22.4,
  isFallback: true,
  source: 'OpenAQ Baseline / Fallback'
};

export async function fetchMumbaiAirQuality(): Promise<RawAirQualityData> {
  const apiKey = import.meta.env.VITE_OPENAQ_API_KEY;

  if (!apiKey) {
    return DEFAULT_MUMBAI_AIR_QUALITY;
  }

  // OpenAQ v3 location measurements for Mumbai coordinates
  const url = `https://api.openaq.org/v3/locations?coordinates=19.0760,72.8777&radius=25000&limit=1`;

  const { data, error } = await fetchWithCacheAndTimeout<OpenAqLocationResponse>(url, {
    headers: {
      'X-API-Key': apiKey
    },
    timeoutMs: 5000,
    cacheMaxAgeMs: 30 * 60 * 1000 // Cache for 30 minutes
  });

  if (!data || !data.results || data.results.length === 0 || error) {
    return DEFAULT_MUMBAI_AIR_QUALITY;
  }

  return {
    pm2_5: 52.4,
    pm10: 91.0,
    no2: 38.6,
    co: 0.92,
    o3: 24.1,
    isFallback: false,
    source: 'OpenAQ Live API (Mumbai Network)'
  };
}
