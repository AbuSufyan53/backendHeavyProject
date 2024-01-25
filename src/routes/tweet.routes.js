import { Router } from "express";
import { Tweet } from "../models/tweet.models.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

// Create Tweet 
router.route("/createTweet").post(createTweet)

// Get User Tweets
router.route("/getUserTweets/:userId").get(getUserTweets)

// Update Tweet 
router.route("/updateTweet/:tweetId").patch(updateTweet)

// Delete Tweet
router.route("/deleteTweet/:tweetId").delete(deleteTweet)

export default router