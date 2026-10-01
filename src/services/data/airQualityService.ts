import { fetchMumbaiAirQuality, DEFAULT_MUMBAI_AIR_QUALITY } from '../api/openAq';
import type { AirQualityContext, DataServiceStatus } from '../../types/api';

let airQualityStatus: DataServiceStatus['airQuality'] = {
  status: 'simulated',
  provider: 'OpenAQ Network',
  note: 'Initializing air quality sensors...'
};

export async function getAirQuality(): Promise<{
  airQuality: AirQualityContext;
  status: DataServiceStatus['airQuality'];
}> {
  try {
    const raw = await fetchMumbaiAirQuality();
    
    const pm25 = raw.pm2_5 || 48.5;
    let label = 'Satisfactory';
    if (pm25 > 60) label = 'Poor';
    else if (pm25 > 30) label = 'Moderate';

    const airQuality: AirQualityContext = {
      pm2_5: raw.pm2_5,
      pm10: raw.pm10,
      no2: raw.no2,
      co: raw.co,
      o3: raw.o3,
      aqi: Math.round(pm25 * 2.1), // Indicative AQI scaling
      label,
      updatedAt: new Date().toISOString(),
      disclaimer: 'Ambient air-quality context observation (Not direct attribution)',
      isFallback: raw.isFallback
    };

    airQualityStatus = {
      status: raw.isFallback ? 'cached' : 'live',
      provider: raw.source,
      updatedAt: airQuality.updatedAt,
      note: raw.isFallback ? 'Using ambient baseline observation' : 'Live sensor data'
    };

    return { airQuality, status: airQualityStatus };
  } catch {
    const airQuality: AirQualityContext = {
      pm2_5: DEFAULT_MUMBAI_AIR_QUALITY.pm2_5,
      pm10: DEFAULT_MUMBAI_AIR_QUALITY.pm10,
      no2: DEFAULT_MUMBAI_AIR_QUALITY.no2,
      co: DEFAULT_MUMBAI_AIR_QUALITY.co,
      o3: DEFAULT_MUMBAI_AIR_QUALITY.o3,
      aqi: 102,
      label: 'Moderate',
      updatedAt: new Date().toISOString(),
      disclaimer: 'Ambient air-quality context observation',
      isFallback: true
    };

    airQualityStatus = {
      status: 'fallback',
      provider: 'OpenAQ (Fallback)',
      updatedAt: airQuality.updatedAt,
      note: 'Air quality feed unavailable. Using ambient baseline.'
    };

    return { airQuality, status: airQualityStatus };
  }
}

export function getAirQualityStatus(): DataServiceStatus['airQuality'] {
  return airQualityStatus;
}
