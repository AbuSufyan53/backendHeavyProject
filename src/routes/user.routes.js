import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
// https://www.youtube.com/watch?v=VKXnSwNm_lE&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=14 18:00
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

// https://www.youtube.com/watch?v=7DVpag3cO0g&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=16 52:00
router.route("/login").post(loginUser)

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)

export default router