# WasteWise Real External API Integration Architecture

This document outlines the real-world external API integrations powering the WasteWise Digital Twin and Bottleneck Analysis Engine.

---

## Architecture Overview

```
                 EXTERNAL DATA SOURCES
                           │
       ┌───────────────────┼───────────────────┐
       ↓                   ↓                   ↓
  Open-Meteo          OSRM Routing         data.gov.in
(Weather Feed)       (Route Matrix)     (Govt Waste Data)
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ↓
                   DATA SERVICE LAYER
       (Caching, Fallbacks & Normalization)
                           ↓
                   SIMULATION ENGINE
         (Waste Flow Graph, Min-Cost Flow,
       Min-Cut, Shadow Price & Queue Engine)
                           ↓
                    REACT UI LAYER
       (Dashboard, Map, What-If, Bottlenecks,
      Root Cause, Environmental, Optimization)
```

---

## Integrated APIs

### 1. Open-Meteo Weather API
- **Purpose**: Live weather observations & forecasts for Mumbai Metropolitan Region (19.0760° N, 72.8777° E).
- **Endpoint**: `https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`
- **Authentication**: None required.
- **Data Used**: Temperature (°C), precipitation (mm), rain (mm), wind speed (km/h), weather code, relative humidity.
- **Cache Duration**: 15 minutes (In-memory & localStorage).
- **Fallback**: Last known weather observation or static Mumbai monsoon baseline (`28.5°C, 4.2 mm rain`).
- **Simulation Impact**:
  - `rainTravelMultiplier`: Multiplies route travel times and delays (e.g. Heavy Rain $\rightarrow 1.45\times$).
  - `vehicleCapacityReduction`: Reduces effective truck payload capacity during heavy waterlogging ($12\%$ reduction).
  - `collectionDelayMultiplier`: Increases collection zone backlog accumulation ($1.5\times$).
  - Displayed in top navbar (`TopBar.tsx`) with timestamp and live status.

---

### 2. OSRM Road Routing API
- **Purpose**: Road network route geometry, distances, travel durations, and table matrix.
- **Endpoints**:
  - Route: `https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson`
  - Table Matrix: `https://router.project-osrm.org/table/v1/driving/{coord_list}?annotations=duration,distance`
- **Authentication**: Public demo endpoint (or custom self-hosted instance via env).
- **Data Used**: Exact road distance (`distanceKm`), estimated travel time (`travelTimeMinutes`), GeoJSON polyline geometry.
- **Cache Duration**: 24 hours for routes, 12 hours for matrix tables.
- **Fallback**: Haversine geographical distance formula with $1.35\times$ urban winding factor and $25\text{ km/h}$ heavy truck speed assumption.
- **Simulation Impact**:
  - Calculates edge transport distances for every facility connection.
  - Computes fleet diesel burn: $\text{Fuel} = \frac{\text{Distance} \times \text{Trips}}{\text{Efficiency}}$.
  - Computes transport $\text{CO}_2\text{e}$ emissions based on actual route length.
  - Renders real OSRM polyline paths on the Leaflet Network Map (`CommandCenter.tsx`).

---

### 3. Open Government Data Platform (data.gov.in)
- **Purpose**: Official Indian municipal solid waste generation, vehicle fleet, and processing facility datasets.
- **Endpoint**: `https://api.data.gov.in/resource/3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69`
- **Authentication**: API key via `VITE_DATAGOV_API_KEY`.
- **Data Used**: Vehicle count, vehicle capacity (tonnes), daily waste generated, processing capacity, collection efficiency.
- **Cache Duration**: 12 hours.
- **Fallback**: Normalized Central Pollution Control Board (CPCB) / Swachh Bharat Mumbai municipal dataset baseline.
- **Simulation Impact**:
  - Hydrates initial vehicle fleet configuration and facility baseline capacities.
  - Labelled as `Government Dataset / Synthetic Demo` when running on fallback.

---

### 4. OpenAQ Ambient Air Quality API
- **Purpose**: Ambient air quality context (PM2.5, PM10, $\text{NO}_2$, CO, $\text{O}_3$) surrounding municipal facilities.
- **Endpoint**: `https://api.openaq.org/v3/locations?coordinates=19.0760,72.8777&radius=25000`
- **Authentication**: API key via `VITE_OPENAQ_API_KEY`.
- **Data Used**: PM2.5, PM10, $\text{NO}_2$, CO, $\text{O}_3$ concentrations ($\mu\text{g/m}^3$).
- **Cache Duration**: 30 minutes.
- **Fallback**: Mumbai ambient air quality baseline ($48.5\ \mu\text{g/m}^3\ \text{PM2.5}$).
- **Simulation Impact**:
  - Provides ambient environmental context in `EnvironmentalImpact.tsx`.
  - Includes explicit legal/analytical disclaimer: *"Ambient air-quality context observation"*.

---

### 5. Traffic Provider Service
- **Purpose**: Route congestion multipliers and travel time adjustments.
- **Implementation**: Traffic provider abstraction in `trafficProvider.ts`.
- **Authentication**: `VITE_TRAFFIC_API_KEY` (if live commercial provider connected).
- **Data Used**: Route traffic multiplier ($1.00\times$ normal to $1.80\times$ severe).
- **Cache Duration**: Real-time / 15 minutes.
- **Fallback**: Operational scenario simulated traffic.
- **Simulation Impact**:
  - Multiplies OSRM base travel times to reflect peak hours or monsoon waterlogging.

---

## Environment Variables Configuration

Create a `.env` file in the root directory:

```env
VITE_DATAGOV_API_KEY=your_datagov_key_here
VITE_OPENAQ_API_KEY=your_openaq_key_here
VITE_MAP_TILE_URL=https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
VITE_TRAFFIC_API_KEY=
```

---

## Fallback & Error Resilience

All API calls wrap requests inside `fetchWithCacheAndTimeout` with:
1. Strict timeouts (5000ms - 6000ms) using `AbortController`.
2. Automatic fallback to expired local caches if network drops.
3. Fallback to robust deterministic mathematical models if external APIs are completely unreachable.
4. Zero unhandled promise rejections or UI crashes.
