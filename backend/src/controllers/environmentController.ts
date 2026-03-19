import { Request, Response } from "express";
import {
  fetchAirData,
  getAirHistory,
} from "../services/openaqService";
import { fetchWeatherData, getWeatherHistory } from "../services/weatherService";
import {
  fetchBiodiversityData,
  getBiodiversityHistory,
} from "../services/biodiversityService";
import { getMapData as getUnifiedMapData } from "../services/mapService";

export async function getAirData(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await fetchAirData();
    console.info(`[EnvironmentController] Returning ${data.length} air points`);
    res.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch air data";

    res.status(500).json({ message });
  }
}

export async function getAirHistoryData(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await getAirHistory(50);
    console.info(
      `[EnvironmentController] Returning ${data.length} air history points`
    );
    res.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch air history";

    res.status(500).json({ message });
  }
}

export async function getWeatherData(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await fetchWeatherData();
    console.info(`[EnvironmentController] Returning ${data.length} weather rows`);
    res.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch weather data";

    res.status(500).json({ message });
  }
}

export async function getBiodiversityData(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await fetchBiodiversityData();
    console.info(
      `[EnvironmentController] Returning ${data.length} biodiversity rows`
    );
    res.json(data);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch biodiversity data";

    res.status(500).json({ message });
  }
}

export async function getAllEnvironmentData(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const [air, weather, biodiversity] = await Promise.all([
      fetchAirData(),
      fetchWeatherData(),
      fetchBiodiversityData(),
    ]);

    res.json({
      air,
      weather,
      biodiversity,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch combined environment data";

    res.status(500).json({ message });
  }
}

export async function getAllEnvironmentHistory(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const [air, weather, biodiversity] = await Promise.all([
      getAirHistory(50),
      getWeatherHistory(50),
      getBiodiversityHistory(50),
    ]);

    res.json({
      air,
      weather,
      biodiversity,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch combined environment history";

    res.status(500).json({ message });
  }
}

export async function getMapData(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    let data = await getUnifiedMapData(200);

    if (data.length === 0) {
      console.info("[EnvironmentController] Map requested with empty DB, hydrating from sources");
      await Promise.all([
        fetchAirData(),
        fetchWeatherData(),
        fetchBiodiversityData(),
      ]);

      data = await getUnifiedMapData(200);
    }

    console.info(`[EnvironmentController] Returning ${data.length} map points`);
    res.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch map data";

    res.status(500).json({ message });
  }
}
