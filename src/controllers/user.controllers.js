// https://www.youtube.com/watch?v=HqcGLJSORaA&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=14

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

// https://www.youtube.com/watch?v=7DVpag3cO0g&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=16 18:00
const generateAccessAndRefreshToken = async (userId) => {
    try {
        console.log("::::", userId)
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        // console.log("accessToken:::", accessToken)
        const refreshToken = user.generateRefreshToken()
        // console.log("refreshToken:::", refreshToken)

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token.")
    }
}

// register user
const registerUser = asyncHandler(async (req, res) => {
    // https://www.youtube.com/watch?v=VKXnSwNm_lE&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=14
    // get user details from user
    // validation - not empty
    // check if user already exists: username se ya email se
    // check for images, check for avatar
    // upload them to cloudinary, avtar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { fullName, email, username, password } = req.body
    // res.status(200).json({ msg: "Okay", email })

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "") //some:::https://www.youtube.com/watch?v=VKXnSwNm_lE&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=14 23:00
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with same email or username already exists.")
    }

    // console.log(req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
        console.log("coverImageLocalPath:", coverImageLocalPath)
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required.")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("coverImage: ", coverImage)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required.")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password" - "refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user.")
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "created user successfully"))
})


// loginUser
const loginUser = asyncHandler(async (req, res) => {
    // req body = data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookies

    const { email, username, password } = req.body
    console.log("line:110:email: ", email)
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required.")
    // }

    //mera wala
    // const userExisted = await User.findOne({
    //     $and:[{
    //         $or:[{email, username}], 
    //         password
    //     }]
    // })

    const userExisted = await User.findOne({
        $or: [{ username }, { email }]
    })
    console.log({ "userExisted: ": userExisted })
    if (!userExisted) {
        throw new ApiError(404, "user does not exists.")
    }

    //important topic 
    // https://www.youtube.com/watch?v=7DVpag3cO0g&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=16 15:20
    const isPasswordValid = await userExisted.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "password is not correct, invalid Credentials.")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(userExisted._id)

    const loggedInUser = await User.findById(userExisted._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,

    }
    console.log("accessToken =>", accessToken)
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "user logged in successfully."
            )
        )

})

// log out user:::
// https://www.youtube.com/watch?v=7DVpag3cO0g&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=16 33:30

const logoutUser = asyncHandler(async (req, res) => {
    const logoutuser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    console.log(logoutuser)


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

// https://www.youtube.com/watch?v=L2_gIrDxCes&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=22
// refresh accessToken
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.accessToken || req.body.refreshToken
    if (!refreshAccessToken) {
        throw new ApiError(401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new ApiError(401, "invalid refresh token.")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used.")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, refreshToken }, "token refreshed.")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

// https://www.youtube.com/watch?v=9azRerL6CZc&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=19
// change Password
const changeCurrentPassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully."))
})

// https://www.youtube.com/watch?v=9azRerL6CZc&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=19
// get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current User fetched successfully"))
})

// https://www.youtube.com/watch?v=9azRerL6CZc&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=19
// update Account Details
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email
        }
    },
        {
            new: true
        }).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Account details updated suuccessfully."))
})

// https://www.youtube.com/watch?v=9azRerL6CZc&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=27 30:00
// update User Avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing.")
    }

    // TODO :: delete Old Image - assignment https://www.youtube.com/watch?v=4_Ge2QEcT8k&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=19

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar.")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        },
    ).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Avatar is updated"))
})

// https://www.youtube.com/watch?v=9azRerL6CZc&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=27 30:00
// update User Cover Imaage
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing.")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImageLocalPath.url) {
        throw new ApiError(400, "Error while uploading cover image.")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }).select("-password")

    return res.status(200).json(new ApiResponse(200, user, "Cover Image Updated Successfully."))
})

// https://www.youtube.com/watch?v=fDTf1mk-jQg&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=22
// get user channel profile:::

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing.")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",  // in mongodb it gets plural and in lowercase::: https://www.youtube.com/watch?v=fDTf1mk-jQg&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=22 20:00
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscribers",
                as: "subscribedTo"
            }
        },
        {
            // https://www.youtube.com/watch?v=fDTf1mk-jQg&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=22 23:00
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: { //condition
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }

    ])
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }
    return res.status(200).json(new ApiResponse(200, channel[0], "User channe  l fetched successfully."))
})

// https://www.youtube.com/watch?v=qNnR7cuVliI&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=21
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)   //https://www.youtube.com/watch?v=qNnR7cuVliI&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=21 7:00
            }
        },
        {
            $lookup: {
                from: "videos", //start with small letter and get converted into plural
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully."))
})


export { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory }