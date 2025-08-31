from fastapi import APIRouter, HTTPException
from ..db import supabase

router = APIRouter(prefix="/api/site-recommendations", tags=["recommendations"])

TABLE = "siterecommendations"

@router.get("/")
def list_centers():
    try:
        res = supabase.table(TABLE).select("*").execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching data: {str(e)}")
    
    return res.data or []
