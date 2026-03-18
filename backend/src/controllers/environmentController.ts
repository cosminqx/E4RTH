import { Request, Response } from "express";
import { fetchLatestMeasurements } from "../services/openaqService";

export async function getEnvironmentData(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const data = await fetchLatestMeasurements();
    console.info(`[EnvironmentController] Returning ${data.length} points`);
    res.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch environment data";

    res.status(500).json({ message });
  }
}
