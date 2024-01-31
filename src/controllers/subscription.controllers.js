import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Subscription } from "../models/subscription.models.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";

// Toggle Subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription👇
    if (!channelId) {
        throw new ApiError(400, "Channel id is required.")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel id not valid.")
    }

    const channelExists = await User.findById(channelId);

    if (!channelExists) {
        throw new ApiError(404, "Channel not found");
    }

    const userId = req.user?._id

    const isSubscriberExist = await Subscription.findOne({ subscriber: userId, channel: channelId })

    if (!isSubscriberExist) {
        const subscribe = await Subscription.create({ subscriber: userId, channel: channelId })
        if (!subscribe) {
            throw new ApiError(400, "Error occured in subscribing channel.")
        }
        return res.status(200).json(new ApiResponse(200, subscribe, "Channel subscribed successfully."))
    } else {
        const deleteSubscriber = await Subscription.deleteOne({ subscriber: userId, channel: channelId })

        if (!deleteSubscriber) {
            throw new ApiError(400, "Error occured in unsubscribing channel.")
        }
        return res.status(200).json(new ApiResponse(200, deleteSubscriber, "Channel unsubscribed successsfully."))
    }
})
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) {
        throw new ApiError(400, "Channel id is required.")
    }
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel id not valid.")
    }

    const channelExists = await User.findById(channelId);

    if (!channelExists) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.aggregate([{
        $match: {
            channel: new mongoose.Types.ObjectId(channelId)
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "subscriber",
            foreignField: "_id",
            as: "subscriberInfo",
            pipeline: [{
                $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                }
            }]
        }
    },
    {
        $addFields: {
            subscriberInfo: {
                $first: "$subscriberInfo"
            }
        }
    }
    ])

    if (subscribers.length === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "Channel has no subscriber yet."))
    }

    return res.status(200).json(new ApiResponse(200, subscribers, "Channel subscribers fetched successfully."))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Subscribed id is required.")
    }
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Subscribed id not valid.")
    }

    const userExist = await User.findById(subscriberId)

    if (!userExist) {
        throw new ApiError(404, "User not found");
    }

    const channelList = await Subscription.aggregate([{
        $match: {
            subscriber: new mongoose.Types.ObjectId(subscriberId)
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "channelInfo",
            pipeline: [{
                $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                }
            }]
        }
    },
    {
        $addFields: {
            channelInfo: {
                $first: "$channelInfo"
            }
        }
    }])
    if (channelList.length === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "User has not subscribet anybody yet."))
    }

    return res.status(200).json(new ApiResponse(200, channelList, "ChannelList of user has fetched successfully."))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}