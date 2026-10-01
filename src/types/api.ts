export type ApiStatus = 'live' | 'cached' | 'simulated' | 'fallback' | 'unavailable';

export interface DataServiceStatus {
  weather: { status: ApiStatus; provider: string; updatedAt?: string; note?: string };
  routing: { status: ApiStatus; provider: string; updatedAt?: string; note?: string };
  wasteData: { status: ApiStatus; provider: string; updatedAt?: string; note?: string };
  airQuality: { status: ApiStatus; provider: string; updatedAt?: string; note?: string };
  traffic: { status: ApiStatus; provider: string; updatedAt?: string; note?: string };
}

export interface WeatherData {
  temperature: number; // °C
  weatherCode: number;
  conditionLabel: string;
  precipitationMm: number;
  rainMm: number;
  windSpeedKmH: number;
  humidityPct?: number;
  visibilityKm?: number;
  updatedAt: string;
  isFallback?: boolean;
}

export interface WeatherImpactMultipliers {
  rainTravelMultiplier: number;
  heavyRainTravelMultiplier: number;
  vehicleCapacityReduction: number;
  collectionDelayMultiplier: number;
}

export interface RouteGeometry {
  coordinates: [number, number][]; // [lat, lng] array for Leaflet
  type: string;
}

export interface NormalizedRoute {
  sourceId: string;
  destinationId: string;
  distanceKm: number;
  durationMinutes: number;
  geometry?: RouteGeometry;
  provider: 'OSRM' | 'Haversine Fallback' | 'Cached OSRM';
  updatedAt: string;
}

export interface DistanceMatrixResult {
  matrix: Record<string, Record<string, { distanceKm: number; durationMinutes: number }>>;
  provider: string;
  updatedAt: string;
}

export interface NormalizedWasteDataset {
  vehicleCount: number;
  vehicleCapacity: number;
  collectionEfficiency: number;
  wasteCollectedTonnesPerDay: number;
  processingCapacityTonnesPerDay: number;
  facilityType: string;
  source: string;
  updatedAt: string;
  isFallback: boolean;
}

export interface AirQualityContext {
  pm2_5?: number; // µg/m³
  pm10?: number; // µg/m³
  no2?: number; // µg/m³
  co?: number; // mg/m³ or µg/m³
  o3?: number; // µg/m³
  aqi?: number;
  label: string;
  updatedAt: string;
  disclaimer: string;
  isFallback: boolean;
}

export interface TrafficStatus {
  trafficMultiplier: number; // 1.00 = normal, 1.20 = moderate, 1.50 = heavy, 1.80 = severe
  label: 'Normal' | 'Moderate' | 'Heavy' | 'Severe';
  provider: string;
  updatedAt: string;
  isSimulated: boolean;
}
