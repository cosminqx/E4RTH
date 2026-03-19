import prisma from "./dbService";

export type MapCategory = "air" | "weather" | "biodiversity";

export interface MapDataPoint {
  lat: number;
  lng: number;
  category: MapCategory;
  type: string;
  value: number | string;
  level?: "low" | "moderate" | "high";
  metadata?: Record<string, unknown>;
}

type TimedMapDataPoint = MapDataPoint & {
  timestamp: Date;
};

export async function getMapData(limitPerCategory = 200): Promise<MapDataPoint[]> {
  const safeLimit = Math.max(1, Math.min(limitPerCategory, 200));

  const [airRows, weatherRows, biodiversityRows] = await Promise.all([
    prisma.airMeasurement.findMany({
      orderBy: { timestamp: "desc" },
      take: safeLimit,
    }),
    prisma.weatherData.findMany({
      orderBy: { timestamp: "desc" },
      take: safeLimit,
    }),
    prisma.biodiversityRecord.findMany({
      orderBy: { timestamp: "desc" },
      take: safeLimit,
    }),
  ]);

  const air: TimedMapDataPoint[] = airRows.map((item) => ({
    lat: item.lat,
    lng: item.lng,
    category: "air",
    type: item.type,
    value: item.value,
    level: item.level as "low" | "moderate" | "high",
    timestamp: item.timestamp,
  }));

  const weather: TimedMapDataPoint[] = weatherRows.map((item) => ({
    lat: item.lat,
    lng: item.lng,
    category: "weather",
    type: "temperature",
    value: item.temperature,
    metadata: {
      windSpeed: item.windSpeed,
      weatherCode: item.weatherCode,
      apparentTemperature: item.apparentTemperature,
    },
    timestamp: item.timestamp,
  }));

  const biodiversity: TimedMapDataPoint[] = biodiversityRows.map((item) => ({
    lat: item.lat,
    lng: item.lng,
    category: "biodiversity",
    type: item.species,
    value: item.occurrenceCount,
    metadata: {
      source: item.source,
    },
    timestamp: item.timestamp,
  }));

  const merged = [...air, ...weather, ...biodiversity].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return merged.map(({ timestamp: _timestamp, ...point }) => point);
}
