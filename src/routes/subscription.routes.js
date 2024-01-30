import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controllers.js";

const router = Router()

router.use(verifyJWT)

// toggleSubscription
router.route("/toggleSubscription/:channelId").patch(toggleSubscription)

// GetUser Channel Subscribers
router.route("/getUserChannelSubscribers/:channelId").get(getUserChannelSubscribers)

// Get Subscribed Channels
router.route("/getSubscribedChannels/:subscriberId").get(getSubscribedChannels)

export default router