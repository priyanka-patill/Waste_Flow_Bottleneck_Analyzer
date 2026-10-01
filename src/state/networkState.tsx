import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { NetworkState, NetworkLevers, WasteFlowAnalysisResult, NetworkNode, NetworkEdge, VehicleConfig } from '../types/wasteNetwork';
import type { DataServiceStatus } from '../types/api';
import { INITIAL_NODES, INITIAL_EDGES } from '../data/wasteData';
import { runCompleteAnalysis } from '../engine/simulation';
import { getWeather, getWeatherImpactMultipliers } from '../services/data/weatherService';
import { getAirQuality } from '../services/data/airQualityService';
import { fetchWasteVehicleData } from '../services/data/wasteDataService';
import { getRoute, getRoutingStatus } from '../services/data/routingService';
import { getTrafficStatus } from '../services/api/trafficProvider';
import { fetchFromBackend } from '../services/apiClient';

const STORAGE_KEY = 'waste_flow_network_config_v2';

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

  // Requirement 1 Process & Fleet Configuration API
  updateNode: (nodeId: string, updatedFields: Partial<NetworkNode>) => void;
  addNode: (node: NetworkNode) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  updateEdge: (edgeId: string, updatedFields: Partial<NetworkEdge>) => void;
  addEdge: (edge: NetworkEdge) => void;
  deleteEdge: (edgeId: string) => void;

  updateVehicleConfig: (updatedConfig: Partial<VehicleConfig>) => void;
  applyConfiguration: (newNodes?: NetworkNode[], newEdges?: NetworkEdge[], newVehicleConfig?: VehicleConfig) => void;
  resetToDefault: () => void;
}

const defaultLevers: NetworkLevers = {
  sortingCapDelta: 180,
  vehiclesDelta: 0,
  targetRecoveryPct: 71,
  operatingHours: 18,
  routeStrategy: 'Dynamic Freeway Rerouting'
};

const buildDefaultNetworkState = (): NetworkState => ({
  nodes: INITIAL_NODES.map(n => ({
    ...n,
    queueTonnes: n.queueTonnes || 0,
    processingRateTonnesPerHour: parseFloat(n.processingRate?.split(' ')[0] || '160'),
    operatingHours: 16,
    costPerTon: 120,
    co2FactorTonPerTon: 0.35,
    collectionFrequency: n.collectionFrequency || 'once_daily',
    vehiclesAssigned: n.vehiclesAssigned || (n.type === 'collection' ? 20 : undefined),
    vehicleCapacityAssignedTonnes: n.vehicleCapacityAssignedTonnes || (n.type === 'collection' ? 12 : undefined),
    recoveryPct: n.recoveryPct || (n.type === 'processing' ? 75 : n.type === 'sorting' ? 65 : undefined),
    processingTimeMins: n.type === 'sorting' ? 45 : n.type === 'processing' ? 60 : 30,
    totalLandfillCapacityTonnes: n.totalLandfillCapacityTonnes || (n.type === 'landfill' ? n.capacityTonnes : undefined),
    currentFilledVolumeTonnes: n.currentFilledVolumeTonnes || (n.type === 'landfill' ? n.currentTonnes : undefined)
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
    co2EmissionFactorKgPerLiter: 2.68,
    avgSpeedKmPerHour: 28
  },
  levers: defaultLevers,
  activeScenarioId: undefined
});

const defaultDataStatus: DataServiceStatus = {
  weather: { status: 'simulated', provider: 'Open-Meteo' },
  routing: { status: 'simulated', provider: 'OSRM Engine' },
  wasteData: { status: 'simulated', provider: 'data.gov.in' },
  airQuality: { status: 'simulated', provider: 'OpenAQ' },
  traffic: { status: 'simulated', provider: 'Traffic Provider' }
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [networkState, setNetworkState] = useState<NetworkState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges) && parsed.vehicleConfig) {
          return {
            ...buildDefaultNetworkState(),
            ...parsed
          };
        }
      }
    } catch (err) {
      console.warn('Failed to load saved configuration from localStorage:', err);
    }
    return buildDefaultNetworkState();
  });

  const [dataServiceStatus, setDataServiceStatus] = useState<DataServiceStatus>(defaultDataStatus);

  // Save changes to localStorage
  const persistState = useCallback((stateToSave: NetworkState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nodes: stateToSave.nodes,
        edges: stateToSave.edges,
        vehicleConfig: stateToSave.vehicleConfig,
        levers: stateToSave.levers
      }));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, []);

  // Hydrate external API data & optional FastAPI backend synchronization
  const refreshApiData = useCallback(async () => {
    try {
      const backendRes = await fetchFromBackend<{ dataSources?: Record<string, string> }>('/api/dashboard/summary').catch(() => null);
      if (backendRes?.isBackendLive) {
        console.log('FastAPI Backend synchronized live at http://localhost:8000/api');
      }

      const weatherRes = await getWeather().catch(() => null);
      const weatherImpact = weatherRes ? getWeatherImpactMultipliers(weatherRes.weather) : undefined;
      const aqRes = await getAirQuality().catch(() => null);
      const wasteGovRes = await fetchWasteVehicleData().catch(() => null);
      const trafficRes = getTrafficStatus({ scenarioId: networkState.activeScenarioId });

      const updatedEdges = await Promise.all(
        networkState.edges.map(async (edge): Promise<NetworkEdge> => {
          try {
            const srcNode = networkState.nodes.find(n => n.id === edge.from);
            const destNode = networkState.nodes.find(n => n.id === edge.to);
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
        trafficStatus: trafficRes || prev.trafficStatus
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
  }, [networkState.activeScenarioId, networkState.nodes, networkState.edges]);

  useEffect(() => {
    refreshApiData();
    const interval = setInterval(refreshApiData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshApiData]);

  // Compute master simulation analysis whenever networkState changes
  const analysis = useMemo(() => {
    return runCompleteAnalysis(networkState);
  }, [networkState]);

  // Network CRUD & Levers Functions
  const updateNode = (nodeId: string, updatedFields: Partial<NetworkNode>) => {
    setNetworkState(prev => {
      const nextNodes = prev.nodes.map(n => n.id === nodeId ? { ...n, ...updatedFields } : n);
      const nextState = { ...prev, nodes: nextNodes };
      persistState(nextState);
      return nextState;
    });
  };

  const addNode = (newNode: NetworkNode) => {
    setNetworkState(prev => {
      const nextNodes = [...prev.nodes, newNode];
      const nextState = { ...prev, nodes: nextNodes };
      persistState(nextState);
      return nextState;
    });
  };

  const deleteNode = (nodeId: string) => {
    setNetworkState(prev => {
      const nextNodes = prev.nodes.filter(n => n.id !== nodeId);
      const nextEdges = prev.edges.filter(e => e.from !== nodeId && e.to !== nodeId);
      const nextState = { ...prev, nodes: nextNodes, edges: nextEdges };
      persistState(nextState);
      return nextState;
    });
  };

  const duplicateNode = (nodeId: string) => {
    setNetworkState(prev => {
      const targetNode = prev.nodes.find(n => n.id === nodeId);
      if (!targetNode) return prev;

      const newId = `${targetNode.type}-${Date.now().toString(36)}`;
      const duplicated: NetworkNode = {
        ...targetNode,
        id: newId,
        name: `${targetNode.name} (Copy)`,
        lat: targetNode.lat + 0.015,
        lng: targetNode.lng + 0.015
      };

      const nextNodes = [...prev.nodes, duplicated];
      const nextState = { ...prev, nodes: nextNodes };
      persistState(nextState);
      return nextState;
    });
  };

  const updateEdge = (edgeId: string, updatedFields: Partial<NetworkEdge>) => {
    setNetworkState(prev => {
      const nextEdges = prev.edges.map(e => e.id === edgeId ? { ...e, ...updatedFields } : e);
      const nextState = { ...prev, edges: nextEdges };
      persistState(nextState);
      return nextState;
    });
  };

  const addEdge = (newEdge: NetworkEdge) => {
    setNetworkState(prev => {
      const nextEdges = [...prev.edges, newEdge];
      const nextState = { ...prev, edges: nextEdges };
      persistState(nextState);
      return nextState;
    });
  };

  const deleteEdge = (edgeId: string) => {
    setNetworkState(prev => {
      const nextEdges = prev.edges.filter(e => e.id !== edgeId);
      const nextState = { ...prev, edges: nextEdges };
      persistState(nextState);
      return nextState;
    });
  };

  const updateVehicleConfig = (updatedConfig: Partial<VehicleConfig>) => {
    setNetworkState(prev => {
      const nextConfig = { ...prev.vehicleConfig, ...updatedConfig };
      const nextState = { ...prev, vehicleConfig: nextConfig };
      persistState(nextState);
      return nextState;
    });
  };

  const applyConfiguration = (newNodes?: NetworkNode[], newEdges?: NetworkEdge[], newVehicleConfig?: VehicleConfig) => {
    setNetworkState(prev => {
      const nextState = {
        ...prev,
        nodes: newNodes || prev.nodes,
        edges: newEdges || prev.edges,
        vehicleConfig: newVehicleConfig || prev.vehicleConfig
      };
      persistState(nextState);
      return nextState;
    });
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage remove error:', e);
    }
    const fresh = buildDefaultNetworkState();
    setNetworkState(fresh);
  };

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
        refreshApiData,
        updateNode,
        addNode,
        deleteNode,
        duplicateNode,
        updateEdge,
        addEdge,
        deleteEdge,
        updateVehicleConfig,
        applyConfiguration,
        resetToDefault
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
