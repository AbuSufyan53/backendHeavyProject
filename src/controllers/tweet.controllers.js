import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"

// create tweet
const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet👇
    const { tweet } = req.body
    if (!tweet) {
        throw new ApiError(400, "Tweet is required.")
    }

    const newTweet = await Tweet.create({
        content: tweet,
        owner: req.user?._id
    })

    return res.status(200).json(new ApiResponse(200, newTweet, "tweet created"))
})

// get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets👇

    // res.json({"msg":"hi"})


    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Provide valid userId")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(400, "User not found")
    }

    const options = {
        page,
        limit
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    ])
    console.log("tweets:::", tweets)

    const userTweets = await Tweet.aggregatePaginate(
        tweets,
        options
    );

    if (userTweets.totalDocs === 0) {
        return res.status(200).json(new ApiResponse(200, userTweets, "User has no tweet yet."))
    }

    return res.status(200).json(new ApiResponse(200, userTweets, "User tweets fetched successfully."))

})

// Update Tweet
const updateTweet = asyncHandler(async (req, res) => {
    // res.json({msg:"hi"})
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "tweet id is required.")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweet id is invalid.")
    }
    const { tweet } = req.body

    if (!tweet) {
        throw new ApiError(400, "tweet is required.")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, {
        $set: {
            content: tweet,
        },
    },
        {
            new: true
        })

    if (!updatedTweet) {
        throw new ApiError(400, "Unable to update.")
    }

    return res.status(201).json(new ApiResponse(200, updatedTweet, "Tweet updated successfully."))
})

const deleteTweet = asyncHandler(async (req, res) => {
    // res.json({msg:"hi"})
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "tweet id is required.")
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweet id is invalid.")
    }

    const tweetToDelete = await Tweet.findByIdAndDelete(tweetId)

    return res.status(200).json(new ApiResponse(200, tweetToDelete, "tweet is deleted successfully."))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}