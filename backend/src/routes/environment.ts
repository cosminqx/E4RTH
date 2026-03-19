import { Router } from "express";
import {
	getAirData,
	getAirHistoryData,
	getWeatherData,
	getBiodiversityData,
	getAllEnvironmentData,
	getAllEnvironmentHistory,
	getMapData,
} from "../controllers/environmentController";

const router = Router();

router.get("/air", getAirData);
router.get("/weather", getWeatherData);
router.get("/biodiversity", getBiodiversityData);
router.get("/all", getAllEnvironmentData);
router.get("/map", getMapData);

// Backward-compatible aliases
router.get("/data", getAirData);
router.get("/history", getAirHistoryData);
router.get("/all/history", getAllEnvironmentHistory);

export default router;