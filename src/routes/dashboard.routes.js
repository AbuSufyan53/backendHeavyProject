import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router()

router.use(verifyJWT)

// Get Channel Videos
router.route("/getChannelVideos").get(getChannelVideos)

// Get Channel Stats
router.route("/getChannelStats").get(getChannelStats)

export default router