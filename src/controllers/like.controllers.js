import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import mongoose, { isValidObjectId } from "mongoose";

// Toggle Video Like
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video 👇
    if (!videoId) {
        throw new ApiError(400, "video id is required.")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id not valid.")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "No video found.")
    }

    const userId = req.user?._id

    const isLikeExists = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    if (!isLikeExists) {
        const likingVideo = await Like.create({
            video: videoId,
            likedBy: userId
        })

        if (!likingVideo) {
            throw new ApiError(400, "Error while liking a video")
        }
        return res.status(200).json(new ApiResponse(200, likingVideo, `video is liked by ${userId} successfully.`))
    } else {
        const deleteLike = await isLikeExists.deleteOne()
        if (!deleteLike) {
            throw new ApiError(404, "Error while deleting like");
        }
        return res.status(200).json(new ApiResponse(200, {}, "Video liked removed successfully."))
    }
})


// Toggle Comment Like
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment👇
    if (!commentId) {
        throw new ApiError(400, "video id is required.")
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Video id not valid.")
    }

    const comment = await Video.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "No comment found.")
    }

    const userId = req.user?._id

    const isLikeExists = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (!isLikeExists) {
        const likingComment = await Like.create({
            comment: commentId,
            likedBy: userId
        })
        if (!likingComment) {
            throw new ApiError(400, "Error while liking a comment")
        }
        return res.status(200).json(new ApiResponse(200, {}, `Comment is liked by ${userId} successfully.`))
    } else {
        const deleteLike = await isLikeExists.deleteOne()
        if (!deleteLike) {
            throw new ApiError(400, "Error in deleting like.")
        }
        return res.status(200).json(new ApiResponse(200, {}, "Comment liked removed successfully."))
    }
})

// toggleTweetLike
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet👇
    if (!tweetId) {
        throw new ApiError(400, "video id is required.")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Video id not valid.")
    }

    const userId = req.user?._id

    const isLikeExists = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })
    if (!isLikeExists) {
        const likingTweet = await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
        if (!likingTweet) {
            throw new ApiError(400, "Error in liking tweet.")
        }
        return res.status(200).json(new ApiResponse(200, likingTweet, `Tweet is liked by ${userId} successfully.`))
    } else {
        const deleteLike = await isLikeExists.deleteOne()
        if (!deleteLike) {
            throw new ApiError(400, "Error in deleting like.")
        }
        return res.status(200).json(new ApiResponse(200, deleteLike, "Tweet liked removed successfully."))
    }
})

// Get Liked Videos
const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos👇
    const userId = req.user?._id
    const likedVideo = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: {
                    $exists: true,
                },
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
            },
        },
        {
            $addFields: {
                videoDetails: {
                    $first: "$videoDetails",
                },
            },
        },
    ])
    if (likedVideo.length === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "User has not liked any Video."))
    }
    return res.status(200).json(new ApiResponse(200, likedVideo, "Liked video retrieved successfully."))
})
export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}