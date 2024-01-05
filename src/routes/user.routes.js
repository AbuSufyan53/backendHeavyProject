import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controllers.js";
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
// refresh access token
router.route("/refresh-token").post(refreshAccessToken)
// change password
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
// current user
router.route("/current-user",).get(verifyJWT,getCurrentUser)
// update account details
router.route("/update-account-details").patch(verifyJWT,updateAccountDetails)
// update User Avatar
router.route("/update-user-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar) //https://www.youtube.com/watch?v=qNnR7cuVliI&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=21 22:00
// userCoverImaage
router.route("/user-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage) //https://www.youtube.com/watch?v=qNnR7cuVliI&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=21
//Update User Cover Image
router.route("/c/:username").get(verifyJWT, getUserChannelProfile) //https://www.youtube.com/watch?v=qNnR7cuVliI&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=21 26:00
// history
router.route("/history").get(verifyJWT, getWatchHistory)
export default router