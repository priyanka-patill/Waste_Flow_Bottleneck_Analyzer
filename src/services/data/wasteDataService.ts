import { fetchGovWasteRecords, type DataGovRecord } from '../api/dataGov';
import type { NormalizedWasteDataset, DataServiceStatus } from '../../types/api';

let wasteDataStatus: DataServiceStatus['wasteData'] = {
  status: 'simulated',
  provider: 'data.gov.in / CPCB',
  note: 'Initializing municipal dataset...'
};

export function normalizeWasteDataset(record: DataGovRecord, source: string, isFallback: boolean): NormalizedWasteDataset {
  const vehicleCount = typeof record.total_vehicles === 'number'
    ? record.total_vehicles
    : parseInt(String(record.total_vehicles || '182'), 10) || 182;

  const vehicleCapacity = typeof record.vehicle_capacity_tonnes === 'number'
    ? record.vehicle_capacity_tonnes
    : parseFloat(String(record.vehicle_capacity_tonnes || '12')) || 12;

  const collectionEfficiency = typeof record.collection_efficiency_pct === 'number'
    ? record.collection_efficiency_pct
    : parseFloat(String(record.collection_efficiency_pct || '92.4')) || 92.4;

  const wasteCollected = typeof record.daily_waste_generated_tpd === 'number'
    ? record.daily_waste_generated_tpd
    : parseFloat(String(record.daily_waste_generated_tpd || '6850')) || 6850;

  const processingCapacity = typeof record.processing_capacity_tpd === 'number'
    ? record.processing_capacity_tpd
    : parseFloat(String(record.processing_capacity_tpd || '4200')) || 4200;

  return {
    vehicleCount,
    vehicleCapacity,
    collectionEfficiency,
    wasteCollectedTonnesPerDay: wasteCollected,
    processingCapacityTonnesPerDay: processingCapacity,
    facilityType: record.facility_type || 'Integrated Municipal Waste Network',
    source,
    updatedAt: new Date().toISOString(),
    isFallback
  };
}

export async function fetchWasteVehicleData(): Promise<NormalizedWasteDataset> {
  const { records, isFallback, source } = await fetchGovWasteRecords();
  const primaryRecord = records[0] || {};
  
  const normalized = normalizeWasteDataset(primaryRecord, source, isFallback);

  wasteDataStatus = {
    status: isFallback ? 'cached' : 'live',
    provider: source,
    updatedAt: normalized.updatedAt,
    note: isFallback ? 'Government Dataset / Synthetic Demo' : 'data.gov.in API Live Sync'
  };

  return normalized;
}

export async function fetchWasteProcessingData(): Promise<{ totalProcessingCapacity: number; source: string }> {
  const dataset = await fetchWasteVehicleData();
  return {
    totalProcessingCapacity: dataset.processingCapacityTonnesPerDay,
    source: dataset.source
  };
}

export function getWasteDataStatus(): DataServiceStatus['wasteData'] {
  return wasteDataStatus;
}
