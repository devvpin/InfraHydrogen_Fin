from fastapi import APIRouter, HTTPException
from typing import List
from ..db import supabase

router = APIRouter(prefix="/api", tags=["assets"])

TABLE = "existingh2plants"

@router.get("/existingH2Plants", response_model=list[dict])
def list_assets():
    res = supabase.table(TABLE).select("id, Latitude, Longitude, Plant_Name").execute()
    return res.data or []

@router.get("/existingH2Plants/{asset_id}")
def get_asset(asset_id: str):
    res = supabase.table(TABLE).select("*").eq("id", asset_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Data not found")
    return res.data
