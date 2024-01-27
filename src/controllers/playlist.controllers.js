import { Playlist } from "../models/playlist.models.js";
import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.models.js";

// Create Playlist 
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist👇

    console.log("description:::", description)

    if (!name || !description) {
        throw new ApiError(400, "Provide all data")
    }

    if (!isValidObjectId(req?.user?._id)) {
        throw new ApiError(400, "invalid user id")
    }
    if (!req?.user?._id) {
        throw new ApiError(400, "login first")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if (!playlist) {
        throw new ApiError(400, "there is an error while creating playlist")
    }

    return res.status(201).json(new ApiResponse(200, playlist, "Playlist created successfully."))

})

// getUserPlaylists 
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists👇
    if (!userId) {
        throw new ApiError(400, "invalid user id")
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "invalid user id")
    }

    // by using aggregation 
    // const userPlaylist = await Playlist.aggregate([
    //     {
    //         $match:{
    //             owner: new mongoose.Types.ObjectId(userId)
    //         }
    //     }
    // ])

    const userPlaylist = await Playlist.find({ owner: userId })

    if (!userPlaylist) {
        throw new ApiError(400, "error in fetching playlist.")
    }

    console.log(userPlaylist)
    if (userPlaylist.length === 0) {
        return res.status(200).json(new ApiResponse(200, userPlaylist, "No playlist has been created by this user yet."))
    }

    return res.status(200).json(new ApiResponse(200, userPlaylist, "User playlist fetched successfully."))

})

// Get Playlist By Id
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!playlistId) {
        throw new ApiError(400, "Require playlist id.")
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playkist Id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "No Playlist fetched.")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successsfully."))

})

// addVideoToPlaylist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(400, "All Fileds are required.")
    }
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video Id.")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Video not found.")
    }

    const playlistToUpdate = await Playlist.findByIdAndUpdate(playlistId, {
        $push: {
            videos: videoId
        }
    },
        {
            new: true
        })
    if (!playlistToUpdate) {
        throw new ApiError(400, "Unanble to update playlist.")
    }

    return res.status(200).json(new ApiResponse(200, playlistToUpdate, "Video added to Playlist Successfully."))
})

// Remove Video From Playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist👇
    if (!playlistId || !videoId) {
        throw new ApiError(400, "All Fileds are required.")
    }
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video Id.")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "video not found.")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: {
            videos: videoId
        }
    },
        {
            new: true
        })
    return res.status(200).json(new ApiResponse(200, playlist, "Video removed successfully."))

})

// Delete Playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist👇
    if (!playlistId) {
        throw new ApiError(400, "Require playlist id")
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id")
    }

    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User not found or user session expired, please log in.")
    }

    // using try catch
    try {
        const result = await Playlist.deleteOne({ _id: playlistId, owner: userId })
        if (result.deletedCount === 0) {
            return res.status(200).json(new ApiResponse(200, {}, "Playlist not found or unauthorized for current logged in user"))
        } else {
            return res.status(200).json(new ApiResponse(200, result, "Playlist deleted successfully."))
        }
    } catch (error) {
        throw new ApiError(500, "Internal server error")
    }

    // using .then .catch
    // await Playlist.deleteOne({ _id: playlistId, owner: userId })
    // .then((result)=>{
    //     if (result.deletedCount === 0){
    //         return res.status(200).json(new ApiResponse(200, {}, "Playlist not found or unauthorized for current logged in user"))
    //     }else{
    //         return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully."))
    //     }
    // }).catch((err)=>{
    //     throw new ApiError(500, "Internal server error")
    // })
})

// Update Playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist 👇

    if (!playlistId) {
        throw new ApiError(400, "Require playlist id")
    }
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id")
    }

    if (!name || !description) {
        throw new ApiError(400, "Require all fileds")
    }

    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User not found or user session expired, please log in.")
    }

    try {
        const playlist = await Playlist.findOne({ _id: playlistId, owner: userId })
        console.log(playlist)
        if (playlist) {
            const result = await Playlist.updateOne({ _id: playlistId, owner: userId },
                { $set: { name, description } })
            console.log(result)
            if (result.modifiedCount === 0) {
                return res.status(200).json(new ApiResponse(200, {}, "Playlist not found or unauthorized for current logged in user"))
            } else {
                return res.status(200).json(new ApiResponse(200, result, "Playlist updated successfully."))
            }
        }
    } catch (error) {
        throw new ApiError(500, "Internal server error")
    }

    return res.status(400).json(new ApiResponse(400, {}, "some error occured while updating"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}