from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import h2PlantsExisting, renewables, siteRecommendation

app = FastAPI(title="HydroMap FastAPI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(h2PlantsExisting.router)
app.include_router(renewables.router)
app.include_router(siteRecommendation.router)
