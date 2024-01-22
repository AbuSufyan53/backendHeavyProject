import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isObjectIdOrHexString, isValidObjectId } from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.models.js";

// get All Videos
const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: get all videos based on query, sort, pagination
    return res.json({ msg: "hi" })
})

// publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video 👇

    if ([title, description].some(field => field === "")) {
        throw new ApiError(400, "All fields are required")
    }

    console.log(req.files)

    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "video file is required.")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required.")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!video || !thumbnail) {
        throw new ApiError(400, "Error while creating video.")
    }

    // Convert duration to a number, assuming it can be a string or a number
    const duration = typeof video.duration === "string" ? parseFloat(video.duration) : video.duration

    // access publicId
    const videoPublicId = video?.public_id
    const thumbnailPublicId = thumbnail?.public_id

    const newVideo = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        videoPublicId,
        thumbnailPublicId,
        title,
        description,
        duration,
        owner: req.user._id
    })

    if (!newVideo) {
        throw new ApiError(400, "Error while creating video.")
    }

    return res.status(201).json(new ApiResponse(200, newVideo, "Video uploaded successfully."))

})

// get a video from video Id
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id 👇
    if (!videoId) {
        throw new ApiError(400, "videoId is required.")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "no video with this videoId is availbale.")
    }

    if (video.views === undefined) {
        video.views = 1
    } else {
        video.views = video.views + 1
    }

    await video.save()

    let videoDetails = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId),
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscriberCount",
            },
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "videoComments",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            email: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
                subscriberCount: {
                    $size: "$subscriberCount",
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user._id, "$subscriberCount.subscriber"] },
                        then: true,
                        else: false,
                    },
                },
                totalComments: {
                    $size: "$videoComments",
                },
            },
        },
    ]);

    return res.status(200).json(new ApiResponse(200, [video, videoDetails], "video found"))

})

// Update video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId) {
        throw new ApiError(400, "video Id is required.")
    }

    if (!isObjectIdOrHexString(videoId)) {
        throw new ApiError(400, "invalid videoId.")
    }

    const { title, description } = req.body

    if (!title || !description) {
        throw new ApiError(400, "All fields are required.")
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                title,
                description
            }
        },
        {
            new: true
        })

    if (!updatedVideo) {
        throw new ApiResponse(400, "Something went wrong while updating video.")
    }


    return res.status(201).json(new ApiResponse(200, updatedVideo, "Video Updated Successfully."))
})

// delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: delete video👇
    if(!videoId){
        throw new ApiResponse(400, "video Id is required.")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "videoId is invalid.")
    }

    const videoToDelete = await Video.findById(videoId)
    const deleteVideoFromCloudinary = await deleteFromCloudinary(videoToDelete?.videoPublicId)
    const deleteThumbnailFromCloudinary = await deleteFromCloudinary(videoToDelete?.thumbnailPublicId)

    if(!deleteVideoFromCloudinary || !deleteThumbnailFromCloudinary){
        throw new ApiError(400, "Error occured while deleting video and thumbnail from cloudinary")
    }

    const deleteVideoFromDb = await videoToDelete.deleteOne()

    if(!deleteVideoFromDb){
        throw new ApiError(400, "Error while deleting video from Db.")
    }

    // const videoToDelete = await Video.findByIdAndDelete(videoId)

    return res.status(200).json(new ApiResponse(200, deleteVideoFromDb, "Video Deleted"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo
}