import { fetchOsrmRoute, fetchOsrmTable } from '../api/osrm';
import type { NormalizedRoute, DistanceMatrixResult, DataServiceStatus } from '../../types/api';

export interface LocationPoint {
  id: string;
  name?: string;
  lat: number;
  lng: number;
}

let routingStatus: DataServiceStatus['routing'] = {
  status: 'simulated',
  provider: 'OSRM Engine',
  note: 'Initializing routing matrix...'
};

export function normalizeRouteResponse(
  sourceId: string,
  destinationId: string,
  raw: { distanceKm: number; durationMinutes: number; geometry?: any; provider: string }
): NormalizedRoute {
  return {
    sourceId,
    destinationId,
    distanceKm: raw.distanceKm,
    durationMinutes: raw.durationMinutes,
    geometry: raw.geometry,
    provider: raw.provider as any,
    updatedAt: new Date().toISOString()
  };
}

export async function getRoute(
  source: LocationPoint,
  destination: LocationPoint
): Promise<NormalizedRoute> {
  const result = await fetchOsrmRoute(source.lat, source.lng, destination.lat, destination.lng);
  
  routingStatus = {
    status: result.provider === 'OSRM' ? 'live' : 'fallback',
    provider: result.provider,
    updatedAt: new Date().toISOString(),
    note: result.provider === 'OSRM' ? 'Live road route via OSRM' : 'Haversine fallback geometry'
  };

  return normalizeRouteResponse(source.id, destination.id, result);
}

export async function getDistanceMatrix(
  locations: LocationPoint[]
): Promise<DistanceMatrixResult> {
  const { distances, durations, provider } = await fetchOsrmTable(locations);

  const matrix: Record<string, Record<string, { distanceKm: number; durationMinutes: number }>> = {};

  locations.forEach((srcLoc, i) => {
    matrix[srcLoc.id] = {};
    locations.forEach((destLoc, j) => {
      matrix[srcLoc.id][destLoc.id] = {
        distanceKm: distances[i]?.[j] ?? 0,
        durationMinutes: durations[i]?.[j] ?? 0
      };
    });
  });

  routingStatus = {
    status: provider.includes('OSRM') ? 'live' : 'fallback',
    provider,
    updatedAt: new Date().toISOString(),
    note: `Calculated ${locations.length}x${locations.length} travel-time matrix`
  };

  return {
    matrix,
    provider,
    updatedAt: new Date().toISOString()
  };
}

export async function getOptimizedRoute(
  stops: LocationPoint[]
): Promise<{
  orderedStops: LocationPoint[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
}> {
  if (stops.length <= 2) {
    let totalDist = 0;
    let totalDur = 0;
    if (stops.length === 2) {
      const route = await getRoute(stops[0], stops[1]);
      totalDist = route.distanceKm;
      totalDur = route.durationMinutes;
    }
    return {
      orderedStops: stops,
      totalDistanceKm: totalDist,
      totalDurationMinutes: totalDur
    };
  }

  // Simple nearest-neighbor TSP optimization over distance matrix
  const matrixResult = await getDistanceMatrix(stops);
  const matrix = matrixResult.matrix;

  const visited = new Set<string>();
  const ordered: LocationPoint[] = [stops[0]];
  visited.add(stops[0].id);

  let current = stops[0];
  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;

  while (visited.size < stops.length) {
    let next: LocationPoint | null = null;
    let minDist = Infinity;

    for (const candidate of stops) {
      if (!visited.has(candidate.id)) {
        const edgeData = matrix[current.id]?.[candidate.id];
        const dist = edgeData ? edgeData.distanceKm : Infinity;
        if (dist < minDist) {
          minDist = dist;
          next = candidate;
        }
      }
    }

    if (next) {
      visited.add(next.id);
      ordered.push(next);
      const edgeData = matrix[current.id]?.[next.id];
      totalDistanceKm += edgeData?.distanceKm || 0;
      totalDurationMinutes += edgeData?.durationMinutes || 0;
      current = next;
    } else {
      break;
    }
  }

  return {
    orderedStops: ordered,
    totalDistanceKm: Math.round(totalDistanceKm * 10) / 10,
    totalDurationMinutes: Math.round(totalDurationMinutes * 10) / 10
  };
}

export function getRoutingStatus(): DataServiceStatus['routing'] {
  return routingStatus;
}
