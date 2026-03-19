"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { type LngLatLike } from "mapbox-gl";
import {
  getMapData,
  type MapCategory,
  type UnifiedMapPoint,
} from "@/lib/api";
import LayerControls from "@/components/LayerControls";
import "mapbox-gl/dist/mapbox-gl.css";

type LoadState = "loading" | "success" | "error";
type ActiveLayers = Record<MapCategory, boolean>;
type AirGeoJSON = GeoJSON.FeatureCollection<GeoJSON.Point>;

const IASI_CENTER: LngLatLike = [27.6014, 47.1585];
const AIR_SOURCE_ID = "air-source";
const AIR_HEAT_LAYER_ID = "air-heat-layer";
const AIR_CLICK_LAYER_ID = "air-click-layer";
const MAX_MARKERS_PER_LAYER = 150;

const DEFAULT_ACTIVE_LAYERS: ActiveLayers = {
  air: true,
  weather: true,
  biodiversity: true,
};

function getMarkerColor(category: MapCategory): string {
  if (category === "weather") {
    return "#06b6d4";
  }

  return "#c026d3";
}

function toLevelWeight(level: UnifiedMapPoint["level"]): number {
  if (level === "low") {
    return 1;
  }

  if (level === "moderate") {
    return 2;
  }

  return 3;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatValue(value: UnifiedMapPoint["value"]): string {
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  return value;
}

function toPopupHtml(point: UnifiedMapPoint): string {
  const metadataRows = point.metadata
    ? Object.entries(point.metadata)
        .map(
          ([key, value]) =>
            `<div><span style=\"opacity:0.7\">${escapeHtml(key)}</span>: ${escapeHtml(
              String(value)
            )}</div>`
        )
        .join("")
    : "";

  return `<div style=\"font-family: ui-sans-serif, system-ui; padding: 4px 2px; min-width: 180px;\">\
    <div style=\"font-size:12px; text-transform:uppercase; letter-spacing:0.06em; opacity:0.75; margin-bottom:2px;\">${escapeHtml(
      point.category
    )}</div>\
    <div style=\"font-weight:700; margin-bottom:2px;\">${escapeHtml(point.type)}</div>\
    <div style=\"margin-bottom:2px;\">Value: ${escapeHtml(formatValue(
      point.value
    ))}</div>\
    ${point.level ? `<div style=\"margin-bottom:2px;\">Level: ${escapeHtml(point.level)}</div>` : ""}\
    ${metadataRows}\
  </div>`;
}

function toAirGeoJSON(points: UnifiedMapPoint[]): AirGeoJSON {
  return {
    type: "FeatureCollection",
    features: points.map((point) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [point.lng, point.lat],
      },
      properties: {
        lat: point.lat,
        lng: point.lng,
        category: point.category,
        type: point.type,
        value: point.value,
        level: point.level,
        levelWeight: toLevelWeight(point.level),
      },
    })),
  };
}

function parseAirFeature(
  feature: mapboxgl.MapboxGeoJSONFeature
): UnifiedMapPoint | null {
  const lat = feature.properties?.lat;
  const lng = feature.properties?.lng;
  const type = feature.properties?.type;
  const value = feature.properties?.value;
  const level = feature.properties?.level;

  if (
    typeof lat !== "number" ||
    typeof lng !== "number" ||
    typeof type !== "string" ||
    (typeof value !== "number" && typeof value !== "string")
  ) {
    return null;
  }

  const normalizedLevel =
    level === "low" || level === "moderate" || level === "high"
      ? level
      : undefined;

  return {
    lat,
    lng,
    category: "air",
    type,
    value,
    level: normalizedLevel,
  };
}

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<UnifiedMapPoint[]>([]);
  const [activeLayers, setActiveLayers] =
    useState<ActiveLayers>(DEFAULT_ACTIVE_LAYERS);

  const filteredPoints = useMemo(
    () => points.filter((point) => activeLayers[point.category]),
    [points, activeLayers]
  );

  const layerCounts = useMemo(
    () => ({
      air: points.filter((point) => point.category === "air").length,
      weather: points.filter((point) => point.category === "weather").length,
      biodiversity: points.filter((point) => point.category === "biodiversity").length,
    }),
    [points]
  );

  const airPoints = useMemo(
    () => filteredPoints.filter((point) => point.category === "air"),
    [filteredPoints]
  );

  const weatherPoints = useMemo(
    () =>
      filteredPoints
        .filter((point) => point.category === "weather")
        .slice(0, MAX_MARKERS_PER_LAYER),
    [filteredPoints]
  );

  const biodiversityPoints = useMemo(
    () =>
      filteredPoints
        .filter((point) => point.category === "biodiversity")
        .slice(0, MAX_MARKERS_PER_LAYER),
    [filteredPoints]
  );

  const airGeoJSON = useMemo(() => toAirGeoJSON(airPoints), [airPoints]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapContainerRef.current || !token) {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: IASI_CENTER,
      zoom: 11,
      attributionControl: true,
    });

    map.on("load", () => {
      map.addSource(AIR_SOURCE_ID, {
        type: "geojson",
        data: toAirGeoJSON([]),
      });

      map.addLayer({
        id: AIR_HEAT_LAYER_ID,
        type: "heatmap",
        source: AIR_SOURCE_ID,
        maxzoom: 15,
        paint: {
          "heatmap-weight": ["get", "levelWeight"],
          "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 0.8, 11, 1.6],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(22,163,74,0)",
            0.35,
            "#22c55e",
            0.65,
            "#eab308",
            1,
            "#dc2626",
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 12, 12, 28],
          "heatmap-opacity": 0.82,
        },
      });

      // Invisible circles preserve click interactions and popups for individual air points.
      map.addLayer({
        id: AIR_CLICK_LAYER_ID,
        type: "circle",
        source: AIR_SOURCE_ID,
        paint: {
          "circle-radius": 8,
          "circle-opacity": 0,
        },
      });

      map.on("click", AIR_CLICK_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        if (!feature) {
          return;
        }

        const point = parseAirFeature(feature);
        if (!point) {
          return;
        }

        popupRef.current?.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 12 })
          .setLngLat([point.lng, point.lat])
          .setHTML(toPopupHtml(point))
          .addTo(map);
      });

      map.on("mouseenter", AIR_CLICK_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", AIR_CLICK_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      setIsMapReady(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      popupRef.current = null;
      setIsMapReady(false);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fetch environment data from backend
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setState("loading");
        setError(null);
        const data = await getMapData(controller.signal);
        setPoints(data);
        setState("success");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load map data"
        );
        setState("error");
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !isMapReady) {
      return;
    }

    const source = mapRef.current.getSource(AIR_SOURCE_ID) as
      | mapboxgl.GeoJSONSource
      | undefined;

    if (source) {
      source.setData(airGeoJSON);
    }

    const heatVisibility =
      activeLayers.air && airPoints.length > 0 ? "visible" : "none";

    if (mapRef.current.getLayer(AIR_HEAT_LAYER_ID)) {
      mapRef.current.setLayoutProperty(
        AIR_HEAT_LAYER_ID,
        "visibility",
        heatVisibility
      );
    }

    if (mapRef.current.getLayer(AIR_CLICK_LAYER_ID)) {
      mapRef.current.setLayoutProperty(
        AIR_CLICK_LAYER_ID,
        "visibility",
        heatVisibility
      );
    }
  }, [airGeoJSON, airPoints.length, isMapReady, activeLayers.air]);

  // Render weather and biodiversity markers after filters are applied.
  useEffect(() => {
    if (!mapRef.current || !isMapReady || state !== "success") {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    [...weatherPoints, ...biodiversityPoints].forEach((point) => {
      const marker = new mapboxgl.Marker({ color: getMarkerColor(point.category) })
        .setLngLat([point.lng, point.lat])
        .setPopup(new mapboxgl.Popup({ offset: 18 }).setHTML(toPopupHtml(point)))
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [isMapReady, weatherPoints, biodiversityPoints, state]);

  function toggleLayer(category: MapCategory): void {
    setActiveLayers((current) => ({
      ...current,
      [category]: !current[category],
    }));
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="w-full h-[420px] rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        Mapbox token is missing. Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local.
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white dark:bg-neutral-900">
      <div ref={mapContainerRef} className="h-[420px] sm:h-[480px] w-full" />

      {state === "success" && (
        <LayerControls
          activeLayers={activeLayers}
          onToggleLayer={toggleLayer}
          counts={layerCounts}
        />
      )}

      {state === "loading" && (
        <div className="absolute inset-0 bg-white/85 dark:bg-neutral-900/85 flex items-center justify-center">
          <p className="text-neutral-600 dark:text-neutral-300">
            Loading environmental data...
          </p>
        </div>
      )}

      {state === "error" && (
        <div className="absolute inset-0 bg-red-50/95 px-5 py-4 text-sm text-red-700 flex items-center justify-center">
          <div>
            <p className="font-medium">Failed to load map data</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-sm mt-2 opacity-75">
              Make sure the backend is running on http://localhost:5001
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
