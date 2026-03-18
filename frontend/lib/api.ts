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

export type PollutionPoint = {
  lat: number;
  lng: number;
  pm25: number;
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
): Promise<PollutionPoint[]> {
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

  return (await response.json()) as PollutionPoint[];
}
