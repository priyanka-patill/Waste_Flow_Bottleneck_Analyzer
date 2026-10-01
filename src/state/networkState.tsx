import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { NetworkState, NetworkLevers, WasteFlowAnalysisResult, NetworkEdge } from '../types/wasteNetwork';
import type { DataServiceStatus } from '../types/api';
import { INITIAL_NODES, INITIAL_EDGES } from '../data/wasteData';
import { runCompleteAnalysis } from '../engine/simulation';
import { getWeather, getWeatherImpactMultipliers } from '../services/data/weatherService';
import { getAirQuality } from '../services/data/airQualityService';
import { fetchWasteVehicleData } from '../services/data/wasteDataService';
import { getRoute, getRoutingStatus } from '../services/data/routingService';
import { getTrafficStatus } from '../services/api/trafficProvider';

interface NetworkContextType {
  networkState: NetworkState;
  analysis: WasteFlowAnalysisResult;
  dataServiceStatus: DataServiceStatus;
  updateLever: <K extends keyof NetworkLevers>(key: K, value: NetworkLevers[K]) => void;
  resetLevers: () => void;
  selectScenario: (scenarioId: string | undefined) => void;
  applyIntervention: (rank: number) => void;
  runChaosSimulation: (disruptionName: string) => void;
  refreshApiData: () => Promise<void>;
}

const defaultLevers: NetworkLevers = {
  sortingCapDelta: 180,
  vehiclesDelta: 0,
  targetRecoveryPct: 71,
  operatingHours: 18,
  routeStrategy: 'Dynamic Freeway Rerouting'
};

const initialNetworkState: NetworkState = {
  nodes: INITIAL_NODES.map(n => ({
    ...n,
    queueTonnes: n.queueTonnes || 0,
    processingRateTonnesPerHour: parseFloat(n.processingRate?.split(' ')[0] || '160'),
    operatingHours: 16,
    costPerTon: 120,
    co2FactorTonPerTon: 0.35
  })),
  edges: INITIAL_EDGES.map(e => ({
    ...e,
    capacityPerDay: e.tonnesPerDay * 1.25,
    distanceKm: 18,
    travelTimeMinutes: e.delayMins + 25,
    fuelConsumptionPerKm: 0.35,
    transportCostPerTonKm: 18,
    emissionFactorKgCo2PerLiter: 2.68
  })),
  vehicleConfig: {
    vehicleCount: 182,
    vehicleCapacityTonnes: 12,
    fuelEfficiencyKmPerLiter: 3.2,
    operatingHours: 14,
    co2EmissionFactorKgPerLiter: 2.68
  },
  levers: defaultLevers,
  activeScenarioId: undefined
};

const defaultDataStatus: DataServiceStatus = {
  weather: { status: 'simulated', provider: 'Open-Meteo' },
  routing: { status: 'simulated', provider: 'OSRM Engine' },
  wasteData: { status: 'simulated', provider: 'data.gov.in' },
  airQuality: { status: 'simulated', provider: 'OpenAQ' },
  traffic: { status: 'simulated', provider: 'Traffic Provider' }
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkState>(initialNetworkState);
  const [dataServiceStatus, setDataServiceStatus] = useState<DataServiceStatus>(defaultDataStatus);

  // Hydrate external API data (Weather, Routing, Govt Waste Data, Air Quality, Traffic)
  const refreshApiData = useCallback(async () => {
    try {
      // 1. Fetch Weather from Open-Meteo safely
      const weatherRes = await getWeather().catch(() => null);
      const weatherImpact = weatherRes ? getWeatherImpactMultipliers(weatherRes.weather) : undefined;

      // 2. Fetch Air Quality from OpenAQ safely
      const aqRes = await getAirQuality().catch(() => null);

      // 3. Fetch Government Waste Data from data.gov.in safely
      const wasteGovRes = await fetchWasteVehicleData().catch(() => null);

      // 4. Fetch Traffic Status
      const trafficRes = getTrafficStatus({ scenarioId: initialNetworkState.activeScenarioId });

      // 5. Optionally fetch OSRM Route geometry for edges safely with timeout/fallback
      const updatedEdges = await Promise.all(
        initialNetworkState.edges.map(async (edge): Promise<NetworkEdge> => {
          try {
            const srcNode = initialNetworkState.nodes.find(n => n.id === edge.from);
            const destNode = initialNetworkState.nodes.find(n => n.id === edge.to);
            if (srcNode && destNode) {
              const route = await getRoute(
                { id: srcNode.id, lat: srcNode.lat, lng: srcNode.lng },
                { id: destNode.id, lat: destNode.lat, lng: destNode.lng }
              );
              return {
                ...edge,
                distanceKm: route.distanceKm,
                travelTimeMinutes: route.durationMinutes
              };
            }
          } catch {
            // Keep edge intact on error
          }
          return edge;
        })
      );
      const routingStatusInfo = getRoutingStatus();

      setNetworkState(prev => ({
        ...prev,
        edges: updatedEdges.length ? updatedEdges : prev.edges,
        weather: weatherRes?.weather || prev.weather,
        weatherImpact: weatherImpact || prev.weatherImpact,
        airQuality: aqRes?.airQuality || prev.airQuality,
        trafficStatus: trafficRes || prev.trafficStatus,
        vehicleConfig: {
          ...prev.vehicleConfig,
          vehicleCount: wasteGovRes?.vehicleCount || prev.vehicleConfig.vehicleCount,
          vehicleCapacityTonnes: wasteGovRes?.vehicleCapacity || prev.vehicleConfig.vehicleCapacityTonnes
        }
      }));

      if (weatherRes || aqRes || wasteGovRes) {
        setDataServiceStatus(prev => ({
          weather: weatherRes?.status || prev.weather,
          routing: routingStatusInfo || prev.routing,
          wasteData: wasteGovRes
            ? (wasteGovRes.isFallback
                ? { status: 'cached', provider: wasteGovRes.source, note: 'Government Dataset / Synthetic Demo' }
                : { status: 'live', provider: wasteGovRes.source, note: 'data.gov.in Live Sync' })
            : prev.wasteData,
          airQuality: aqRes?.status || prev.airQuality,
          traffic: {
            status: trafficRes.isSimulated ? 'simulated' : 'live',
            provider: trafficRes.provider,
            updatedAt: trafficRes.updatedAt,
            note: trafficRes.isSimulated ? 'Traffic: Simulated operational scenario' : 'Live traffic congestion feed'
          }
        }));
      }
    } catch (err) {
      console.warn('API hydration warning (fallback in use):', err);
    }
  }, []);

  useEffect(() => {
    // Run background API refresh once safely without blocking initial render
    refreshApiData();
    const interval = setInterval(refreshApiData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshApiData]);

  // Compute master simulation analysis whenever networkState changes
  const analysis = useMemo(() => {
    return runCompleteAnalysis(networkState);
  }, [networkState]);

  const updateLever = <K extends keyof NetworkLevers>(key: K, value: NetworkLevers[K]) => {
    setNetworkState(prev => ({
      ...prev,
      levers: {
        ...prev.levers,
        [key]: value
      }
    }));
  };

  const resetLevers = () => {
    setNetworkState(prev => ({
      ...prev,
      levers: { ...defaultLevers, sortingCapDelta: 0 }
    }));
  };

  const selectScenario = (scenarioId: string | undefined) => {
    setNetworkState(prev => ({
      ...prev,
      activeScenarioId: scenarioId
    }));
  };

  const applyIntervention = (rank: number) => {
    if (rank === 1) {
      updateLever('sortingCapDelta', 180);
      updateLever('routeStrategy', 'Dynamic Freeway Rerouting');
    } else if (rank === 2) {
      updateLever('routeStrategy', 'Dynamic Freeway Rerouting');
    } else if (rank === 3) {
      updateLever('operatingHours', 21);
    }
  };

  const runChaosSimulation = (disruptionName: string) => {
    if (disruptionName === 'FACILITY FAILURE') {
      selectScenario('facility-shutdown');
    } else if (disruptionName === 'TRUCK SHORTAGE' || disruptionName === 'STRIKE') {
      selectScenario('truck-strike');
    } else if (disruptionName === 'MONSOON FLOODING' || disruptionName === 'TRAFFIC COLLAPSE') {
      selectScenario('monsoon');
    } else if (disruptionName === 'FESTIVAL SURGE') {
      selectScenario('ganpati');
    } else {
      selectScenario(undefined);
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        networkState,
        analysis,
        dataServiceStatus,
        updateLever,
        resetLevers,
        selectScenario,
        applyIntervention,
        runChaosSimulation,
        refreshApiData
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export function useNetworkState(): NetworkContextType {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkState must be used within a NetworkProvider');
  }
  return context;
}
