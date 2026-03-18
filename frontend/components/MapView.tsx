"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { type LngLatLike } from "mapbox-gl";
import { getEnvironmentData, type EnvironmentMeasurement } from "@/lib/api";
import "mapbox-gl/dist/mapbox-gl.css";

type MarkerLevel = "low" | "moderate" | "high";
type LoadState = "loading" | "success" | "error";

const IASI_CENTER: LngLatLike = [27.6014, 47.1585];

function getMarkerColor(level: MarkerLevel): string {
  if (level === "low") return "#16a34a";
  if (level === "moderate") return "#f59e0b";
  return "#dc2626";
}

function toLabel(level: MarkerLevel): string {
  if (level === "low") return "Low";
  if (level === "moderate") return "Moderate";
  return "High";
}

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<EnvironmentMeasurement[]>([]);
  const [showPm25, setShowPm25] = useState(true);
  const [showPm10, setShowPm10] = useState(true);

  const visibleMeasurements = useMemo(
    () =>
      measurements.filter((entry) => {
        if (entry.type === "pm25") {
          return showPm25;
        }

        return showPm10;
      }),
    [measurements, showPm10, showPm25]
  );

  const pm25Count = measurements.filter((entry) => entry.type === "pm25").length;
  const pm10Count = measurements.filter((entry) => entry.type === "pm10").length;

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
      setIsMapReady(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
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
        const data = await getEnvironmentData(controller.signal);
        setMeasurements(data);
        setState("success");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Failed to load environment data"
        );
        setState("error");
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, []);

  // Add markers to map when both map and data are ready
  useEffect(() => {
    if (!mapRef.current || !isMapReady || state !== "success") {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (visibleMeasurements.length === 0) {
      return;
    }

    visibleMeasurements.forEach((entry) => {
      const popup = new mapboxgl.Popup({ offset: 20 }).setHTML(
        `<div style="font-family: ui-sans-serif, system-ui; padding: 4px 2px;">
          <strong>${entry.type.toUpperCase()}: ${entry.value.toFixed(2)}</strong><br />
          <span>Level: ${toLabel(entry.level)}</span>
        </div>`
      );

      const marker = new mapboxgl.Marker({ color: getMarkerColor(entry.level) })
        .setLngLat([entry.lng, entry.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [isMapReady, visibleMeasurements, state]);

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
        <div className="absolute top-3 left-3 z-10 rounded-xl border border-neutral-200/90 dark:border-neutral-700/90 bg-white/95 dark:bg-neutral-900/95 px-3 py-2 text-xs shadow-sm">
          <p className="font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
            Air Layers
          </p>
          <label className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 mb-1">
            <input
              type="checkbox"
              checked={showPm25}
              onChange={(event) => setShowPm25(event.target.checked)}
            />
            PM2.5 ({pm25Count})
          </label>
          <label className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200">
            <input
              type="checkbox"
              checked={showPm10}
              onChange={(event) => setShowPm10(event.target.checked)}
            />
            PM10 ({pm10Count})
          </label>
        </div>
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
