import { Router } from "express";
import { getEnvironmentData } from "../controllers/environmentController";

const router = Router();

router.get("/data", getEnvironmentData);

export default router;