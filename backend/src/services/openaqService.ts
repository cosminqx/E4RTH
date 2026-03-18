import axios from "axios";

export type MeasurementType = "pm25" | "pm10";
export type PollutionLevel = "low" | "moderate" | "high";

export interface EnvironmentMeasurement {
  lat: number;
  lng: number;
  type: MeasurementType;
  value: number;
  level: PollutionLevel;
}

interface OpenAQSensor {
  id?: number;
  parameter?: {
    id?: number;
    name?: string;
  };
}

interface OpenAQLocation {
  id?: number;
  locality?: string | null;
  country?: {
    code?: string;
  };
  sensors?: OpenAQSensor[];
}

interface OpenAQLocationsResponse {
  results?: OpenAQLocation[];
}

interface OpenAQLatestResult {
  sensorsId?: number;
  value?: number;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

interface OpenAQLatestResponse {
  results?: OpenAQLatestResult[];
}

type CacheState = {
  timestamp: number;
  data: EnvironmentMeasurement[];
};

const OPENAQ_BASE_URL = "https://api.openaq.org/v3";
const DEFAULT_COUNTRY = "RO";
const IASI_CENTER = { lat: 47.1585, lng: 27.6014 };
const IASI_RADIUS_METERS = 25000;
const CACHE_TTL_MS = 60_000;
const TARGET_PARAMETERS: ReadonlySet<MeasurementType> = new Set(["pm25", "pm10"]);

let cache: CacheState | null = null;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toMeasurementType(raw: string | undefined): MeasurementType | null {
  if (!raw) {
    return null;
  }

  const normalized = raw.toLowerCase().replace(".", "");
  return TARGET_PARAMETERS.has(normalized as MeasurementType)
    ? (normalized as MeasurementType)
    : null;
}

function getLevelFromPm25(pm25Value: number): PollutionLevel {
  if (pm25Value <= 12) {
    return "low";
  }

  if (pm25Value <= 35) {
    return "moderate";
  }

  return "high";
}

function isCacheValid(): boolean {
  return Boolean(cache && Date.now() - cache.timestamp < CACHE_TTL_MS);
}

function getHeaders(apiKey: string): Record<string, string> {
  return {
    "X-API-Key": apiKey,
    "Content-Type": "application/json",
  };
}

function toServiceError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) {
      return new Error("OpenAQ authentication failed. Check OPENAQ_API_KEY.");
    }

    return new Error(`OpenAQ request failed with status ${status ?? "unknown"}`);
  }

  return error instanceof Error ? error : new Error("Unexpected OpenAQ error");
}

export async function fetchLatestMeasurements(): Promise<EnvironmentMeasurement[]> {
  if (isCacheValid() && cache) {
    console.info(`[OpenAQ] Using cache with ${cache.data.length} points`);
    return cache.data;
  }

  const apiKey = process.env.OPENAQ_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAQ_API_KEY is missing in backend environment");
  }

  const locationParams = new URLSearchParams({
    coordinates: `${IASI_CENTER.lat},${IASI_CENTER.lng}`,
    radius: String(IASI_RADIUS_METERS),
    limit: "100",
  });

  const locationsUrl = `${OPENAQ_BASE_URL}/locations?${locationParams.toString()}`;
  try {
    const locationsResponse = await axios.get<OpenAQLocationsResponse>(locationsUrl, {
      headers: getHeaders(apiKey),
    });

    const iasiLocations = (locationsResponse.data.results ?? []).filter((location) => {
      const locality = normalizeText(location.locality ?? "");
      return location.country?.code === DEFAULT_COUNTRY && locality.includes("iasi");
    });

    const measurementsNested = await Promise.all(
      iasiLocations.map(async (location) => {
        const locationId = location.id;
        if (typeof locationId !== "number") {
          return [] as EnvironmentMeasurement[];
        }

        const parameterBySensorId = new Map<number, MeasurementType>();
        for (const sensor of location.sensors ?? []) {
          if (typeof sensor.id !== "number") {
            continue;
          }

          const type = toMeasurementType(sensor.parameter?.name);
          if (!type) {
            continue;
          }

          parameterBySensorId.set(sensor.id, type);
        }

        if (parameterBySensorId.size === 0) {
          return [] as EnvironmentMeasurement[];
        }

        const latestUrl = `${OPENAQ_BASE_URL}/locations/${locationId}/latest`;
        const latestResponse = await axios.get<OpenAQLatestResponse>(latestUrl, {
          headers: getHeaders(apiKey),
        });

        const pm25ValueByCoordinate = new Map<string, number>();
        for (const item of latestResponse.data.results ?? []) {
          const lat = item.coordinates?.latitude;
          const lng = item.coordinates?.longitude;
          const value = item.value;

          if (
            typeof lat !== "number" ||
            typeof lng !== "number" ||
            typeof value !== "number" ||
            typeof item.sensorsId !== "number"
          ) {
            continue;
          }

          if (parameterBySensorId.get(item.sensorsId) === "pm25") {
            pm25ValueByCoordinate.set(`${lat},${lng}`, value);
          }
        }

        const measurements: EnvironmentMeasurement[] = [];
        for (const item of latestResponse.data.results ?? []) {
          const lat = item.coordinates?.latitude;
          const lng = item.coordinates?.longitude;
          const value = item.value;
          const sensorId = item.sensorsId;

          if (
            typeof lat !== "number" ||
            typeof lng !== "number" ||
            typeof value !== "number" ||
            typeof sensorId !== "number"
          ) {
            continue;
          }

          const type = parameterBySensorId.get(sensorId);
          if (!type) {
            continue;
          }

          const coordinateKey = `${lat},${lng}`;
          const pm25Value =
            type === "pm25"
              ? value
              : pm25ValueByCoordinate.get(coordinateKey) ?? value;

          measurements.push({
            lat,
            lng,
            type,
            value,
            level: getLevelFromPm25(pm25Value),
          });
        }

        return measurements;
      })
    );

    const data = measurementsNested.flat();
    cache = {
      timestamp: Date.now(),
      data,
    };

    console.info(`[OpenAQ] Fetched ${data.length} normalized points`);
    return data;
  } catch (error) {
    throw toServiceError(error);
  }
}
