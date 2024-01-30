import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Subscription } from "../models/subscription.models.js";

// getChannelStats 
const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.👇
    const userId = req.user?._id

    const totalVideoAndViews = await Video.aggregate([{
        $match: {
            owner: new mongoose.Types.ObjectId(userId)
        }
    },
    {
        $group: {
            _id: "$owner",
            totalViews: {
                $sum: "$views"
            },
            totalvideo: {
                $sum: 1
            }
        }
    }
    ])

    const subscribersCount = await Subscription.aggregate([{
        $match: {
            channel: new mongoose.Types.ObjectId(userId)
        }
    },
    {
        $group: {
            _id: "$channel",
            totalSubscribers: {
                $sum: 1
            }
        }
    }])

    const totalLikes = await Video.aggregate([
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group:{
                _id:"owner",
                totalLikes:{
                    $sum:1
                }
            }
        }
        
    ])

    return res.status(200).json(new ApiResponse(200, [totalVideoAndViews, subscribersCount,totalLikes], "total no of video fetched."))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel👇
    const userId = req.user?._id
    const channelVideos = await Video.aggregate([{
        $match: {
            owner: new mongoose.Types.ObjectId(userId)
        },
    }])
    if (channelVideos.length === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "User have no video yet."))

    }
    return res.status(200).json(new ApiResponse(200, channelVideos, "Video fetched successfully."))
})

export {
    getChannelVideos,
    getChannelStats
}