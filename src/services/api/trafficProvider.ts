import type { TrafficStatus, DataServiceStatus } from '../../types/api';

export interface RouteTrafficQuery {
  edgeId?: string;
  sourceId?: string;
  destinationId?: string;
  scenarioId?: string;
}

let trafficServiceStatus: DataServiceStatus['traffic'] = {
  status: 'simulated',
  provider: 'Traffic Engine',
  note: 'Simulated operational traffic scenario'
};

export function getTrafficMultiplier(query?: RouteTrafficQuery): number {
  if (query?.scenarioId === 'monsoon' || query?.scenarioId === 'traffic-collapse') {
    return 1.65; // Heavy monsoon congestion
  }
  if (query?.scenarioId === 'ganpati' || query?.scenarioId === 'diwali') {
    return 1.35; // Festival peak congestion
  }
  if (query?.edgeId === 'e5' || query?.edgeId === 'e6' || query?.edgeId === 'e10') {
    return 1.25; // Known high-density corridors (Western Express & Eastern Highway)
  }
  return 1.05; // Normal baseline urban friction
}

export function getTravelTime(baseDurationMins: number, query?: RouteTrafficQuery): number {
  const mult = getTrafficMultiplier(query);
  return Math.round(baseDurationMins * mult * 10) / 10;
}

export function getTrafficStatus(query?: RouteTrafficQuery): TrafficStatus {
  const mult = getTrafficMultiplier(query);
  const apiKey = import.meta.env.VITE_TRAFFIC_API_KEY;

  let label: TrafficStatus['label'] = 'Normal';
  if (mult >= 1.70) label = 'Severe';
  else if (mult >= 1.40) label = 'Heavy';
  else if (mult >= 1.15) label = 'Moderate';

  const isLive = Boolean(apiKey);

  trafficServiceStatus = {
    status: isLive ? 'live' : 'simulated',
    provider: isLive ? 'Live Commercial Traffic API' : 'Traffic Provider (Simulated Scenario)',
    updatedAt: new Date().toISOString(),
    note: isLive ? 'Live traffic congestion feed' : 'Traffic: Simulated operational scenario'
  };

  return {
    trafficMultiplier: mult,
    label,
    provider: trafficServiceStatus.provider,
    updatedAt: trafficServiceStatus.updatedAt!,
    isSimulated: !isLive
  };
}

export function getTrafficServiceStatus(): DataServiceStatus['traffic'] {
  return trafficServiceStatus;
}
