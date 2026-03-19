/**
 * API Configuration and Utilities
 *
 * IMPORTANT: This frontend (Next.js on port 3000) communicates with a separate Express backend (port 5001).
 *
 * Why separate ports?
 * - Next.js has built-in API routes (/app/api/*), but we use an Express backend instead
 * - Separating frontend and backend provides clearer architecture and independent scaling
 * - The Express backend handles all business logic, database queries, and external integrations
 * - Next.js API routes would compete with Express routes, causing confusion
 *
 * Port mapping:
 * - Frontend (Next.js): http://localhost:3000
 * - Backend (Express): http://localhost:5001
 */

export type MeasurementType = "pm25" | "pm10";
export type PollutionLevel = "low" | "moderate" | "high";
export type MapCategory = "air" | "weather" | "biodiversity";

export type EnvironmentMeasurement = {
  lat: number;
  lng: number;
  type: MeasurementType;
  value: number;
  level: PollutionLevel;
};

export type UnifiedMapPoint = {
  lat: number;
  lng: number;
  category: MapCategory;
  type: string;
  value: number | string;
  level?: PollutionLevel;
  metadata?: Record<string, unknown>;
};

/**
 * Base URL for the Express backend.
 * Uses NEXT_PUBLIC_API_URL env var if available, otherwise defaults to localhost:5001
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

/**
 * Fetch environmental data (pollution points) from the backend
 * GET /api/environment/data
 */
export async function getEnvironmentData(
  signal?: AbortSignal
): Promise<EnvironmentMeasurement[]> {
  const response = await fetch(`${API_BASE_URL}/api/environment/data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch environment data with status ${response.status}`
    );
  }

  return (await response.json()) as EnvironmentMeasurement[];
}

/**
 * Fetch unified map data from backend
 * GET /api/environment/map
 */
export async function getMapData(
  signal?: AbortSignal
): Promise<UnifiedMapPoint[]> {
  const response = await fetch(`${API_BASE_URL}/api/environment/map`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch map data with status ${response.status}`);
  }

  return (await response.json()) as UnifiedMapPoint[];
}
