import { fetchMumbaiWeather, DEFAULT_MUMBAI_WEATHER } from '../api/openMeteo';
import type { WeatherData, WeatherImpactMultipliers, DataServiceStatus } from '../../types/api';

let cachedWeather: WeatherData = DEFAULT_MUMBAI_WEATHER;
let statusInfo: DataServiceStatus['weather'] = {
  status: 'simulated',
  provider: 'Open-Meteo API',
  note: 'Initializing live weather...'
};

export async function getWeather(): Promise<{ weather: WeatherData; status: DataServiceStatus['weather'] }> {
  try {
    const { weather, isFallback } = await fetchMumbaiWeather();
    cachedWeather = weather;

    statusInfo = {
      status: isFallback ? 'cached' : 'live',
      provider: 'Open-Meteo',
      updatedAt: weather.updatedAt,
      note: isFallback ? 'Using cached weather observation' : 'Live weather sync'
    };

    return { weather, status: statusInfo };
  } catch (err) {
    statusInfo = {
      status: 'fallback',
      provider: 'Open-Meteo (Fallback)',
      updatedAt: cachedWeather.updatedAt,
      note: 'Weather data unavailable. Using last known values.'
    };
    return { weather: cachedWeather, status: statusInfo };
  }
}

export function getWeatherImpactMultipliers(weather: WeatherData): WeatherImpactMultipliers {
  const rain = weather.rainMm || weather.precipitationMm || 0;
  const isHeavyRain = rain >= 10 || weather.weatherCode >= 95;
  const isModerateRain = rain >= 2 || (weather.weatherCode >= 61 && weather.weatherCode <= 82);

  if (isHeavyRain) {
    return {
      rainTravelMultiplier: 1.45,
      heavyRainTravelMultiplier: 1.70,
      vehicleCapacityReduction: 0.12, // 12% reduced trip capacity due to waterlogging
      collectionDelayMultiplier: 1.50
    };
  }

  if (isModerateRain) {
    return {
      rainTravelMultiplier: 1.20,
      heavyRainTravelMultiplier: 1.35,
      vehicleCapacityReduction: 0.05,
      collectionDelayMultiplier: 1.25
    };
  }

  return {
    rainTravelMultiplier: 1.00,
    heavyRainTravelMultiplier: 1.00,
    vehicleCapacityReduction: 0.00,
    collectionDelayMultiplier: 1.00
  };
}
