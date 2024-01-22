import { Router } from "express";
import { Video } from "../models/video.models.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()
router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

// get all video
router.route("/").get(getAllVideos)

// publish a new video
router.route("/publishAVideo").post(
    upload.fields([
        {
            name:"video",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishAVideo)

// get video by videoId
router.route("/getVideo/:videoId").get(getVideoById)

// update Video
router.route("/updateVideo/:videoId").patch(updateVideo)

// delete Video
router.route("/deleteVideo/:videoId").delete(deleteVideo)

export default router