import { Router } from "express";
import { Video } from "../models/video.models.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const router = Router()
router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

// 1.get all video
router.route("/").get(getAllVideos)

// 2.publish a new video
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

// 3.get video by videoId
router.route("/getVideo/:videoId").get(getVideoById)

// 4.update Video
router.route("/updateVideo/:videoId").patch(updateVideo)

// 5.delete Video
router.route("/deleteVideo/:videoId").delete(deleteVideo)

// 6.Toggle Publish Status
router.route("/togglePublishStatus/:videoId").patch(togglePublishStatus)

export default router