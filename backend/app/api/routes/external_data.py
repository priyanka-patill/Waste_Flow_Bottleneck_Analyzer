from fastapi import APIRouter
from app.integrations.open_meteo import fetch_open_meteo_weather
from app.integrations.osrm import fetch_osrm_route
from app.integrations.data_gov import fetch_gov_waste_data
from app.integrations.openaq import fetch_open_aq_air_quality

router = APIRouter(prefix="/external", tags=["External Integrations"])

@router.get("/weather", summary="Get live Open-Meteo weather context")
async def get_weather(lat: float = 19.0760, lng: float = 72.8777):
    data = await fetch_open_meteo_weather(lat, lng)
    return {"success": True, "data": data}

@router.get("/route", summary="Get OSRM route distance & travel time")
async def get_route(src_lat: float, src_lng: float, dest_lat: float, dest_lng: float):
    data = await fetch_osrm_route(src_lat, src_lng, dest_lat, dest_lng)
    return {"success": True, "data": data}

@router.get("/gov-waste", summary="Get verified municipal waste dataset from data.gov.in")
async def get_gov_waste():
    data = await fetch_gov_waste_data()
    return {"success": True, "data": data}

@router.get("/air-quality", summary="Get OpenAQ ambient air quality readings")
async def get_air_quality():
    data = await fetch_open_aq_air_quality()
    return {"success": True, "data": data}
