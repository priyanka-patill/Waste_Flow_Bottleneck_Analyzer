import { fetchWithCacheAndTimeout } from './apiClient';

export interface DataGovRecord {
  state?: string;
  district?: string;
  city?: string;
  total_vehicles?: string | number;
  vehicle_capacity_tonnes?: string | number;
  collection_efficiency_pct?: string | number;
  daily_waste_generated_tpd?: string | number;
  processing_capacity_tpd?: string | number;
  facility_type?: string;
}

export interface DataGovResponse {
  status: string;
  total?: number;
  records?: DataGovRecord[];
}

export async function fetchGovWasteRecords(): Promise<{
  records: DataGovRecord[];
  isFallback: boolean;
  source: string;
}> {
  const apiKey = import.meta.env.VITE_DATAGOV_API_KEY;

  if (!apiKey) {
    return {
      records: getSyntheticGovRecords(),
      isFallback: true,
      source: 'Government Dataset (Swachh Bharat / CPCB Baseline)'
    };
  }

  // Official data.gov.in municipal solid waste resource endpoint
  const url = `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69?api-key=${apiKey}&format=json&limit=10&filters[city]=Mumbai`;

  const { data, error } = await fetchWithCacheAndTimeout<DataGovResponse>(url, {
    timeoutMs: 5000,
    cacheMaxAgeMs: 12 * 60 * 60 * 1000 // Cache for 12 hours
  });

  if (!data || !data.records || data.records.length === 0 || error) {
    return {
      records: getSyntheticGovRecords(),
      isFallback: true,
      source: 'Government Dataset (CPCB Baseline / Fallback)'
    };
  }

  return {
    records: data.records,
    isFallback: false,
    source: 'data.gov.in Live API'
  };
}

function getSyntheticGovRecords(): DataGovRecord[] {
  return [
    {
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      city: 'Mumbai',
      total_vehicles: 182,
      vehicle_capacity_tonnes: 12,
      collection_efficiency_pct: 92.4,
      daily_waste_generated_tpd: 6850,
      processing_capacity_tpd: 4200,
      facility_type: 'Integrated Waste Management Hub'
    }
  ];
}
