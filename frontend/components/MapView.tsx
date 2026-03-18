"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { type LngLatLike } from "mapbox-gl";
import { getEnvironmentData, type PollutionPoint } from "@/lib/api";
import "mapbox-gl/dist/mapbox-gl.css";

type PollutionStatus = "Low" | "Moderate" | "High";
type LoadState = "loading" | "success" | "error";

const IASI_CENTER: LngLatLike = [27.6014, 47.1585];

function getPollutionStatus(pm25: number): PollutionStatus {
  if (pm25 < 15) return "Low";
  if (pm25 < 30) return "Moderate";
  return "High";
}

function getMarkerColor(status: PollutionStatus): string {
  if (status === "Low") return "#16a34a";
  if (status === "Moderate") return "#f59e0b";
  return "#dc2626";
}

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [pollutionPoints, setPollutionPoints] = useState<PollutionPoint[]>([]);

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
        setPollutionPoints(data);
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
    if (
      !mapRef.current ||
      !isMapReady ||
      state !== "success" ||
      pollutionPoints.length === 0
    ) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    pollutionPoints.forEach((point) => {
      const status = getPollutionStatus(point.pm25);
      const popup = new mapboxgl.Popup({ offset: 20 }).setHTML(
        `<div style="font-family: ui-sans-serif, system-ui; padding: 4px 2px;">
          <strong>PM2.5 Level: ${point.pm25}</strong><br />
          <span>Status: ${status}</span>
        </div>`
      );

      const marker = new mapboxgl.Marker({ color: getMarkerColor(status) })
        .setLngLat([point.lng, point.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [isMapReady, pollutionPoints, state]);

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
