import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js"
import { Video } from "../models/video.models.js";
import mongoose, { isValidObjectId } from "mongoose";

// Get Video Comments
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video👇
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!videoId) {
        throw new ApiError(400, "video id is required.")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id not valid.")
    }

    const options = {
        page,
        limit
    }

    const isVideoExist = await Video.findById(videoId)

    if (!isVideoExist) {
        throw new ApiError(400, "Video Does not exist")
    }

    const aggregationPipeline = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    const results = await Comment.aggregatePaginate(aggregationPipeline, options)

    if (!results.totalDocs) {
        return res.status(200).json(new ApiResponse(200, {}, "This video has no comment yet."))
    }

    return res.status(200).json(new ApiResponse(200, { results }, "Comments retrieved successfully."))

})

// Add Comment
const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video👇
    const { videoId } = req.params
    const { content } = req.body

    if (!videoId) {
        throw new ApiError(400, "video id is required.")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id not valid.")
    }
    if (!content) {
        throw new ApiError(400, "Comment is required.")
    }

    const userId = req.user?._id

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: userId,
    })

    if (!comment) {
        throw new ApiError(400, "Error in adding comment.")
    }

    return res.status(201).json(new ApiResponse(200, comment, "Comment added successfully."))

})

// Update Comment
const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment👇
    const { commentId } = req.params
    const { content } = req.body

    if (!commentId) {
        throw new ApiError(400, "video id is required.")
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Video id not valid.")
    }
    if (!content) {
        throw new ApiError(400, "Comment is required.")
    }

    const userId = req.user?._id
    
    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content
        }
    },
    {
        new: true
    }).where({$expr:{
        $eq:["$owner", new mongoose.Types.ObjectId(userId)]
    }})

    if (!updatedComment) {
        throw new ApiError(400, "Error in updating comment, may be userid and commnet owner doesnot matched, or may be error in updating comment.")
    }

    return res.status(201).json(new ApiResponse(201, updatedComment, "Comment updated successfully."))

})

// Delete Comment
const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment👇
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment id is required.")
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment id not valid.")
    }
    const userId = req.user?._id
    const commentToDelete = await Comment.findByIdAndDelete(commentId, {
        $expr: {
            $eq: ["$owner", new mongoose.Types.ObjectId(userId)]
        }
    })

    if (!commentToDelete) {
        throw new ApiError(400, "Error in deleting comment, may be userid and comment owner doesnot matched, or may be error in updating comment.")
    }

    return res.status(200).json(new ApiResponse(200, commentToDelete, "Comment deleted successfully."))

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}