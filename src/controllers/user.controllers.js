// https://www.youtube.com/watch?v=HqcGLJSORaA&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=14

import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res)=>{
    const uname = req.body.uname
    res.status(200).json({msg:"Okay", name:uname})
})

export {registerUser}