type OpenAQLatestItem = {
  value?: number;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  sensorsId?: number;
  locationsId?: number;
};

type OpenAQLatestResponse = {
  results?: OpenAQLatestItem[];
};

type OpenAQSensor = {
  id?: number;
  parameter?: {
    id?: number;
    name?: string;
  };
};

type OpenAQLocation = {
  id?: number;
  locality?: string | null;
  country?: {
    code?: string;
  };
  sensors?: OpenAQSensor[];
};

type OpenAQLocationsResponse = {
  results?: OpenAQLocation[];
};

export type EnvironmentPoint = {
  lat: number;
  lng: number;
  pm25: number;
};

const OPENAQ_BASE_URL = "https://api.openaq.org/v3";
const PM25_PARAMETER_ID = 2;
const DEFAULT_COUNTRY = "RO";
const IASI_CENTER = {
  lat: 47.1585,
  lng: 27.6014,
};
const IASI_RADIUS_METERS = 25000;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function fetchJson<T>(url: string, apiKey: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenAQ request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchIasiPm25Data(): Promise<EnvironmentPoint[]> {
  const apiKey = process.env.OPENAQ_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAQ_API_KEY is missing in backend environment");
  }

  const locationQuery = new URLSearchParams({
    coordinates: `${IASI_CENTER.lat},${IASI_CENTER.lng}`,
    radius: String(IASI_RADIUS_METERS),
    limit: "100",
  });

  const locationsUrl = `${OPENAQ_BASE_URL}/locations?${locationQuery.toString()}`;
  const locationsPayload = await fetchJson<OpenAQLocationsResponse>(
    locationsUrl,
    apiKey
  );

  const iasiLocations = (locationsPayload.results ?? []).filter((location) => {
    const countryCode = location.country?.code;
    const locality = location.locality ?? "";
    const normalizedLocality = normalizeText(locality);

    return countryCode === DEFAULT_COUNTRY && normalizedLocality.includes("iasi");
  });

  const latestPayloads = await Promise.all(
    iasiLocations.map(async (location) => {
      const locationId = location.id;

      if (typeof locationId !== "number") {
        return [] as OpenAQLatestItem[];
      }

      const pm25SensorIds = new Set(
        (location.sensors ?? [])
          .filter((sensor) => sensor.parameter?.id === PM25_PARAMETER_ID)
          .map((sensor) => sensor.id)
          .filter((id): id is number => typeof id === "number")
      );

      if (pm25SensorIds.size === 0) {
        return [] as OpenAQLatestItem[];
      }

      const latestUrl = `${OPENAQ_BASE_URL}/locations/${locationId}/latest`;
      const latestPayload = await fetchJson<OpenAQLatestResponse>(latestUrl, apiKey);

      return (latestPayload.results ?? []).filter(
        (item) =>
          typeof item.sensorsId === "number" && pm25SensorIds.has(item.sensorsId)
      );
    })
  );

  const points: EnvironmentPoint[] = latestPayloads
    .flat()
    .map((row) => {
      const lat = row.coordinates?.latitude;
      const lng = row.coordinates?.longitude;
      const pm25 = row.value;

      if (
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        typeof pm25 !== "number"
      ) {
        return null;
      }

      return { lat, lng, pm25 };
    })
    .filter((point): point is EnvironmentPoint => point !== null);

  return points;
}
