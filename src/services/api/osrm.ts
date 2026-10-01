import { fetchWithCacheAndTimeout } from './apiClient';
import type { RouteGeometry } from '../../types/api';

export interface OsrmRouteResponse {
  code: string;
  routes?: Array<{
    distance: number; // in meters
    duration: number; // in seconds
    geometry?: {
      coordinates: [number, number][]; // [lng, lat]
      type: string;
    } | string;
  }>;
}

export interface OsrmTableResponse {
  code: string;
  durations?: number[][]; // in seconds
  distances?: number[][]; // in meters
}

// Calculate Haversine distance in km as fallback
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function fetchOsrmRoute(
  sourceLat: number,
  sourceLng: number,
  destLat: number,
  destLng: number
): Promise<{
  distanceKm: number;
  durationMinutes: number;
  geometry?: RouteGeometry;
  provider: 'OSRM' | 'Haversine Fallback';
}> {
  // Format coordinates: lng,lat;lng,lat
  const url = `https://router.project-osrm.org/route/v1/driving/${sourceLng},${sourceLat};${destLng},${destLat}?overview=full&geometries=geojson`;

  const { data, error } = await fetchWithCacheAndTimeout<OsrmRouteResponse>(url, {
    timeoutMs: 5000,
    cacheMaxAgeMs: 24 * 60 * 60 * 1000 // Cache for 24 hours
  });

  if (!data || data.code !== 'Ok' || !data.routes || data.routes.length === 0 || error) {
    // Fallback calculation: Haversine distance * 1.35 road winding factor
    const directKm = haversineDistance(sourceLat, sourceLng, destLat, destLng);
    const roadKm = Math.round(directKm * 1.35 * 10) / 10;
    // Assume average urban heavy truck speed 25 km/h -> 2.4 mins per km
    const estMins = Math.round(roadKm * 2.4);

    return {
      distanceKm: Math.max(roadKm, 1),
      durationMinutes: Math.max(estMins, 3),
      geometry: {
        type: 'LineString',
        coordinates: [
          [sourceLat, sourceLng],
          [destLat, destLng]
        ]
      },
      provider: 'Haversine Fallback'
    };
  }

  const route = data.routes[0];
  const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
  const durationMinutes = Math.round((route.duration / 60) * 10) / 10;

  let geo: RouteGeometry | undefined;
  if (route.geometry && typeof route.geometry === 'object' && Array.isArray(route.geometry.coordinates)) {
    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
    const leafletCoords = route.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );
    geo = {
      type: 'LineString',
      coordinates: leafletCoords
    };
  }

  return {
    distanceKm: Math.max(distanceKm, 1),
    durationMinutes: Math.max(durationMinutes, 3),
    geometry: geo,
    provider: 'OSRM'
  };
}

export async function fetchOsrmTable(
  coords: Array<{ id: string; lat: number; lng: number }>
): Promise<{
  durations: number[][]; // in minutes
  distances: number[][]; // in km
  provider: 'OSRM Table' | 'Haversine Fallback';
}> {
  if (coords.length === 0) {
    return { durations: [], distances: [], provider: 'OSRM Table' };
  }

  const coordString = coords.map(c => `${c.lng},${c.lat}`).join(';');
  const url = `https://router.project-osrm.org/table/v1/driving/${coordString}?annotations=duration,distance`;

  const { data, error } = await fetchWithCacheAndTimeout<OsrmTableResponse>(url, {
    timeoutMs: 6000,
    cacheMaxAgeMs: 12 * 60 * 60 * 1000 // Cache table for 12 hours
  });

  if (!data || data.code !== 'Ok' || !data.durations || !data.distances || error) {
    // Generate Haversine distance matrix fallback
    const distances: number[][] = [];
    const durations: number[][] = [];

    for (let i = 0; i < coords.length; i++) {
      distances[i] = [];
      durations[i] = [];
      for (let j = 0; j < coords.length; j++) {
        if (i === j) {
          distances[i][j] = 0;
          durations[i][j] = 0;
        } else {
          const direct = haversineDistance(coords[i].lat, coords[i].lng, coords[j].lat, coords[j].lng);
          const road = Math.round(direct * 1.35 * 10) / 10;
          distances[i][j] = road;
          durations[i][j] = Math.round(road * 2.4);
        }
      }
    }
    return { distances, durations, provider: 'Haversine Fallback' };
  }

  // Convert durations (secs -> mins) and distances (m -> km)
  const durationsMins = data.durations.map(row => row.map(d => Math.round((d / 60) * 10) / 10));
  const distancesKm = data.distances.map(row => row.map(d => Math.round((d / 1000) * 10) / 10));

  return {
    durations: durationsMins,
    distances: distancesKm,
    provider: 'OSRM Table'
  };
}
