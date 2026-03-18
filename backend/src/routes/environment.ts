import { Router } from "express";
import { fetchIasiPm25Data } from "../services/openaqService";

const router = Router();

router.get("/data", async (_req, res) => {
  try {
    const points = await fetchIasiPm25Data();
    res.json(points);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch OpenAQ data";

    res.status(502).json({
      error: message,
    });
  }
});

export default router;