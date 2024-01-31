// https://www.youtube.com/watch?v=7DVpag3cO0g&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=16 38:00

import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if(!token){
            throw new ApiError(401,"unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("password refreshToken")
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