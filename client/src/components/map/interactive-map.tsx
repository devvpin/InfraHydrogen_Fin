import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap as useLeafletMap,
} from "react-leaflet";
import L, { Icon, divIcon } from "leaflet";
import { AssetMarker } from "./asset-marker";
import {
  useInfrastructureAssets,
  useRenewableSources,
  useDemandCenters,
} from "@/hooks/use-infrastructure";
import { useMap } from "@/hooks/use-map";
import type { InfrastructureAsset } from "@shared/schema";
import "leaflet/dist/leaflet.css";

// ---------------- Fix Default Marker ----------------
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// ---------------- Marker Icons ----------------
const createMarkerIcon = (type: string, color: string) =>
  divIcon({
    className: `infrastructure-marker ${type}`,
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

const markerIcons: Record<string, Icon> = {
  "hydrogen-plant": createMarkerIcon("hydrogen-plant", "#F59E0B") as unknown as Icon,
  "storage-facility": createMarkerIcon("storage-facility", "#3B82F6") as unknown as Icon,
  pipeline: createMarkerIcon("pipeline", "#F59E0B") as unknown as Icon,
  "distribution-hub": createMarkerIcon("distribution-hub", "#8B5CF6") as unknown as Icon,
  "renewable-source": createMarkerIcon("renewable-source", "#14B8A6") as unknown as Icon,
  "demand-center": createMarkerIcon("demand-center", "#EF4444") as unknown as Icon,
};

// ---------------- Controller ----------------
interface MapControllerProps {
  onMapReady: (map: L.Map) => void;
}
function MapController({ onMapReady }: MapControllerProps) {
  const map = useLeafletMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (map && !hasInitialized.current) {
      onMapReady(map);
      hasInitialized.current = true;
    }
  }, [map, onMapReady]);

  return null;
}

// ---------------- Types ----------------
type RenewableMarker = {
  id: number;
  Station: string;
  Latitude: number;
  Longitude: number;
};

type HydrogenPlantMarker = {
  id: number;
  Plant_Name: string;
  Latitude: number;
  Longitude: number;
};

interface InteractiveMapProps {
  selectedAsset?: InfrastructureAsset | null;
  onAssetSelect?: (asset: InfrastructureAsset | null) => void;
  className?: string;
  predictedSites?: any[];
  onPredictionSelect?: (site: any | null) => void;
  markers?: RenewableMarker[]; // API renewable
  hydrogenMarkers?: HydrogenPlantMarker[]; // API hydrogen
  layerState?: Record<string, boolean>;
}

// ---------------- Auto-fit ----------------
function FitMarkers({
  markers,
}: {
  markers: { Latitude: number; Longitude: number }[];
}) {
  const map = useLeafletMap();
  useEffect(() => {
    if (Array.isArray(markers) && markers.length > 0) {
      const valid = markers.filter(
        (m) => !isNaN(Number(m.Latitude)) && !isNaN(Number(m.Longitude))
      );
      if (valid.length > 0) {
        const bounds = valid.map(
          (m) => [Number(m.Latitude), Number(m.Longitude)] as [number, number]
        );
        map.fitBounds(bounds);
      }
    }
  }, [markers, map]);
  return null;
}

// ---------------- Main Map ----------------
export function InteractiveMap({
  selectedAsset,
  onAssetSelect,
  className,
  predictedSites = [],
  onPredictionSelect,
  markers = [],
  hydrogenMarkers = [],
  layerState = {
    hydrogenPlant: true,
    storageFacility: true,
    pipeline: true,
    distributionHub: true,
    renewableSources: true,
    demandCenters: true,
  },
}: InteractiveMapProps) {
  const { setMapRef, filterState } = useMap();
  const { data: infrastructureAssets = [] } = useInfrastructureAssets();
  const { data: renewableSources = [] } = useRenewableSources();
  const { data: demandCenters = [] } = useDemandCenters();

  // ---------- Filter assets ----------
  const filteredAssets = infrastructureAssets.filter((asset) => {
    if (filterState.types.length > 0 && !filterState.types.includes(asset.type))
      return false;
    if (filterState.regions.length > 0 && !filterState.regions.includes(asset.region))
      return false;
    if (filterState.status.length > 0 && !filterState.status.includes(asset.status))
      return false;
    if (
      filterState.capacityRange.min !== null &&
      asset.capacity &&
      asset.capacity < filterState.capacityRange.min
    )
      return false;
    if (
      filterState.capacityRange.max !== null &&
      asset.capacity &&
      asset.capacity > filterState.capacityRange.max
    )
      return false;
    return true;
  });

  // ---------- Infrastructure markers ----------
  const renderInfrastructureMarkers = () =>
    filteredAssets.map((asset) => {
      const typeKey = asset.type.replace("-", "") as keyof typeof layerState;
      if (!layerState?.[typeKey]) return null;
      const coords = asset.coordinates as { lat: number; lng: number };
      if (!coords) return null;
      return (
        <AssetMarker
          key={asset.id}
          asset={asset}
          position={[coords.lat, coords.lng]}
          icon={markerIcons[asset.type as keyof typeof markerIcons]}
          isSelected={selectedAsset?.id === asset.id}
          onClick={() => onAssetSelect && onAssetSelect(asset)}
        />
      );
    });

  // ---------- Hydrogen markers ----------
  const renderHydrogenMarkers = () =>
    layerState?.hydrogenPlant &&
    hydrogenMarkers.map((plant) => {
      const lat = Number(plant.Latitude);
      const lng = Number(plant.Longitude);
      if (isNaN(lat) || isNaN(lng)) return null;

      return (
        <Marker
          key={plant.id}
          position={[lat, lng]}
          icon={markerIcons["hydrogen-plant"]}
          eventHandlers={{
            click: () => {
              onAssetSelect &&
                onAssetSelect({
                  id: plant.id.toString(),
                  name: plant.Plant_Name,
                  type: "hydrogen-plant",
                  coordinates: { lat, lng },
                });
            },
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{plant.Plant_Name}</h3>
              <p className="text-sm">Hydrogen Plant</p>
            </div>
          </Popup>
        </Marker>
      );
    });

  // ---------- Renewable markers (API) ----------
  const renderApiRenewableMarkers = () =>
    layerState?.renewableSources &&
    markers.map((marker) => {
      const lat = Number(marker.Latitude);
      const lng = Number(marker.Longitude);
      if (isNaN(lat) || isNaN(lng)) return null;

      return (
        <Marker
          key={marker.id}
          position={[lat, lng]}
          icon={markerIcons["renewable-source"]}
          eventHandlers={{
            click: () => {
              onAssetSelect &&
                onAssetSelect({
                  id: marker.id.toString(),
                  name: marker.Station,
                  type: "renewable-source",
                  coordinates: { lat, lng },
                });
            },
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{marker.Station}</h3>
              <p className="text-sm">Renewable Source</p>
            </div>
          </Popup>
        </Marker>
      );
    });

  // ---------- Predicted markers ----------
  const renderPredictedMarkers = () =>
    Array.isArray(predictedSites) &&
    predictedSites.map((site, idx) => {
      const lat = Number(site.Latitude);
      const lng = Number(site.Longitude);
      if (isNaN(lat) || isNaN(lng)) return null;
      return (
        <Marker
          key={`pred-${idx}`}
          position={[lat, lng]}
          icon={markerIcons["hydrogen-plant"]}
          eventHandlers={{
            click: () => onPredictionSelect && onPredictionSelect(site),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">
                {site.Project_Name || "Predicted Site"}
              </h3>
              <p className="text-sm">{site.State || ""}</p>
            </div>
          </Popup>
        </Marker>
      );
    });

  // ---------- Demand markers ----------
  const renderDemandMarkers = () =>
    layerState?.demandCenters &&
    demandCenters.map((center) => {
      const coords = center.coordinates as { lat: number; lng: number };
      if (!coords) return null;
      return (
        <Marker
          key={center.id}
          position={[coords.lat, coords.lng]}
          icon={markerIcons["demand-center"]}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">{center.name}</h3>
              <p className="text-sm capitalize">{center.type}</p>
              <p className="text-sm">Demand: {center.estimatedDemand} tons/year</p>
              <p className="text-xs">{center.region}</p>
            </div>
          </Popup>
        </Marker>
      );
    });

  return (
    <div className={className} data-testid="interactive-map">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        className="w-full h-full"
      >
        <MapController onMapReady={setMapRef} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {renderInfrastructureMarkers()}
        {renderHydrogenMarkers()}
        {renderApiRenewableMarkers()}
        {renderDemandMarkers()}
        {renderPredictedMarkers()}
        <FitMarkers markers={[...(markers || []), ...(hydrogenMarkers || [])]} />
      </MapContainer>
    </div>
  );
}
