import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.controllers.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)

// Get Video Comments
router.route("/getVideoComments/:videoId").get(getVideoComments)

// Add Comment
router.route("/addComment/:videoId").post(addComment)

// Update Comment
router.route("/updateComment/:commentId").patch(updateComment)

// Delete Comment
router.route("/deleteComment/:commentId").delete(deleteComment)

export default router