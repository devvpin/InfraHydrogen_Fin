from fastapi import APIRouter, HTTPException
from ..db import supabase

router = APIRouter(prefix="/api/renewables", tags=["renewables"])

TABLE = "renewablepowerplants"

@router.get("")
def list_sources():
    try:
        res = supabase.table(TABLE).select("id, Station, Latitude, Longitude").execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data: {str(e)}")
