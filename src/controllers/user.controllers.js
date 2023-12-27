// https://www.youtube.com/watch?v=HqcGLJSORaA&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=14

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

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
        throw new ApiError(404, "2user does not exists.")
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
            new ApiResponse(200, {accessToken, refreshToken}, "token refreshed.")
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

export { registerUser, loginUser, logoutUser, refreshAccessToken }