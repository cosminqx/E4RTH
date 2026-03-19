import axios from "axios";
import prisma from "./dbService";

export interface NormalizedWeatherData {
  lat: number;
  lng: number;
  temperature: number;
  apparentTemperature: number;
  windSpeed: number;
  weatherCode: number;
  timestamp: Date;
}

interface OpenMeteoCurrent {
  time?: string;
  temperature_2m?: number;
  apparent_temperature?: number;
  wind_speed_10m?: number;
  weather_code?: number;
}

interface OpenMeteoResponse {
  latitude?: number;
  longitude?: number;
  current?: OpenMeteoCurrent;
}

const IASI_CENTER = { lat: 47.1585, lng: 27.6014 };

function toServiceError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    return new Error(
      `Open-Meteo request failed with status ${error.response?.status ?? "unknown"}`
    );
  }

  return error instanceof Error ? error : new Error("Unexpected Open-Meteo error");
}

async function saveWeatherRows(rows: NormalizedWeatherData[]): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  const result = await prisma.weatherData.createMany({
    data: rows,
    skipDuplicates: true,
  });

  console.info(
    `[DB] Saved weather rows: attempted=${rows.length}, inserted=${result.count}`
  );

  return result.count;
}

export async function fetchWeatherData(): Promise<NormalizedWeatherData[]> {
  const params = new URLSearchParams({
    latitude: String(IASI_CENTER.lat),
    longitude: String(IASI_CENTER.lng),
    current: "temperature_2m,apparent_temperature,wind_speed_10m,weather_code",
    timezone: "UTC",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const response = await axios.get<OpenMeteoResponse>(url);
    const { latitude, longitude, current } = response.data;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !current ||
      typeof current.temperature_2m !== "number" ||
      typeof current.apparent_temperature !== "number" ||
      typeof current.wind_speed_10m !== "number" ||
      typeof current.weather_code !== "number" ||
      typeof current.time !== "string"
    ) {
      return [];
    }

    const timestamp = new Date(current.time);
    if (Number.isNaN(timestamp.getTime())) {
      return [];
    }

    const normalized: NormalizedWeatherData[] = [
      {
        lat: latitude,
        lng: longitude,
        temperature: current.temperature_2m,
        apparentTemperature: current.apparent_temperature,
        windSpeed: current.wind_speed_10m,
        weatherCode: current.weather_code,
        timestamp,
      },
    ];

    const insertedCount = await saveWeatherRows(normalized);
    console.info(
      `[Weather] Fetched ${normalized.length} rows, inserted ${insertedCount} new rows`
    );

    return normalized;
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function getWeatherHistory(limit = 50) {
  return prisma.weatherData.findMany({
    orderBy: { timestamp: "desc" },
    take: limit,
  });
}
