import { fetchWithCacheAndTimeout } from './apiClient';
import type { WeatherData } from '../../types/api';

export interface OpenMeteoResponse {
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m?: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    wind_speed_10m: number;
  };
}

export function getWeatherConditionLabel(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy / Hazy';
  if (code >= 51 && code <= 67) return 'Light Drizzle / Rain';
  if (code >= 71 && code <= 77) return 'Snow Flurry';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm / Monsoon';
  return 'Monsoon / Overcast';
}

export const DEFAULT_MUMBAI_WEATHER: WeatherData = {
  temperature: 28.5,
  weatherCode: 61,
  conditionLabel: 'Monsoon Light Rain',
  precipitationMm: 4.2,
  rainMm: 4.2,
  windSpeedKmH: 14.5,
  humidityPct: 82,
  visibilityKm: 8.5,
  updatedAt: new Date().toISOString(),
  isFallback: true
};

export async function fetchMumbaiWeather(
  lat: number = 19.0760,
  lng: number = 72.8777
): Promise<{ weather: WeatherData; isFallback: boolean }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;

  const { data, fromCache, error } = await fetchWithCacheAndTimeout<OpenMeteoResponse>(url, {
    timeoutMs: 6000,
    cacheMaxAgeMs: 15 * 60 * 1000 // Cache for 15 minutes
  });

  if (!data || !data.current || error) {
    return {
      weather: {
        ...DEFAULT_MUMBAI_WEATHER,
        updatedAt: new Date().toISOString()
      },
      isFallback: true
    };
  }

  const current = data.current;
  const weather: WeatherData = {
    temperature: Math.round(current.temperature_2m * 10) / 10,
    weatherCode: current.weather_code,
    conditionLabel: getWeatherConditionLabel(current.weather_code),
    precipitationMm: Math.round(current.precipitation * 10) / 10,
    rainMm: Math.round(current.rain * 10) / 10,
    windSpeedKmH: Math.round(current.wind_speed_10m * 10) / 10,
    humidityPct: current.relative_humidity_2m,
    visibilityKm: 10,
    updatedAt: new Date().toISOString(),
    isFallback: fromCache
  };

  return { weather, isFallback: fromCache };
}
