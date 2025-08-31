import { useState, useCallback } from "react";
import type L from "leaflet";

// ✅ Marker types
export interface RenewableMarker {
  id: number;
  Station: string;
  Latitude: number;
  Longitude: number;
}

export interface HydrogenPlantMarker {
  id: number;
  Plant_Name: string;
  Latitude: number;
  Longitude: number;
}

export interface LayerState {
  hydrogenPlant: boolean;
  renewableSources: boolean;
  storageFacility: boolean;
  pipeline: boolean;
  distributionHub: boolean;
  demandCenters: boolean;
}

interface FilterState {
  types: string[];
  regions: string[];
  status: string[];
  capacityRange: {
    min: number | null;
    max: number | null;
  };
}

export function useMap() {
  const [mapRef, setMapRefState] = useState<L.Map | null>(null);

  // ✅ Layer toggles
  const [layerState, setLayerState] = useState<LayerState>({
    hydrogenPlant: true,
    renewableSources: true,  // Make sure renewable sources are visible
    storageFacility: true,
    pipeline: true,
    distributionHub: true,
    demandCenters: true,
  });

  const toggleLayer = useCallback((layerName: keyof LayerState) => {
    setLayerState(prev => ({
      ...prev,
      [layerName]: !prev[layerName]
    }));
  }, []);

  // ✅ Filters
  const [filterState, setFilterState] = useState<FilterState>({
    types: [],
    regions: [],
    status: [],
    capacityRange: { min: null, max: null },
  });

  // ✅ Current mouse coordinates
  const [currentCoordinates, setCurrentCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // ✅ Renewable markers
  const [renewableMarkers, setRenewableMarkers] = useState<RenewableMarker[]>([]);

  // ✅ Hydrogen plant markers
  const [hydrogenMarkers, setHydrogenMarkers] = useState<HydrogenPlantMarker[]>([]);

  // ✅ Attach Leaflet map reference & mousemove listener
  const setMapRef = useCallback((map: L.Map) => {
    setMapRefState(map);

    // Listen for mousemove to update coordinates
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      setCurrentCoordinates({
        lat: parseFloat(e.latlng.lat.toFixed(5)),
        lng: parseFloat(e.latlng.lng.toFixed(5)),
      });
    });

    // Clear when mouse leaves
    map.on("mouseout", () => {
      setCurrentCoordinates(null);
    });
  }, []);

  return {
    mapRef,
    setMapRef,
    layerState,
    setLayerState,
    toggleLayer,
    filterState,
    setFilterState,
    currentCoordinates,
    renewableMarkers,
    setRenewableMarkers,
    hydrogenMarkers,
    setHydrogenMarkers,
  };
}

// <InteractiveMap
//   selectedAsset={selectedAsset}
//   onAssetSelect={handleAssetSelect}
//   className="w-full h-full"
//   markers={markers} // ✅ renewable markers
//   hydrogenMarkers={hydrogenMarkers} // ✅ hydrogen markers
// />
