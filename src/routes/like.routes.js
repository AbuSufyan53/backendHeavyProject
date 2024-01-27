import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)

//toggle video like
router.route("/toggleVideoLike/:videoId").post(toggleVideoLike)

// Toggle Comment Like
router.route("/toggleCommentLike/:commentId").post(toggleCommentLike)

// Toggle Tweet Like
router.route("/toggleTweetLike/:tweetId").post(toggleTweetLike)

// Get Liked Videos
router.route("/getLikedVideos").get(getLikedVideos)

export default router