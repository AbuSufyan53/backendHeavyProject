// https://www.youtube.com/watch?v=7DVpag3cO0g&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=16 38:00

import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        console.log("hi im inside auth middleware")
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        console.log("token is ", token)
        
        if(!token){
            throw new ApiError(401,"unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("decodedToken is ", decodedToken)

        const user = await User.findById(decodedToken?._id).select("password refreshToken username")
        console.log("line 21 user is ", user)
        if(!user){
            // TODO ::: discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user

        next()

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})