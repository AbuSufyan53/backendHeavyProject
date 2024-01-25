import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit: "16kb"}))  //https://www.youtube.com/watch?v=S5EpsMjel-M&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=9  16:00  
app.use(express.static("public"))
app.use(cookieParser())

// https://www.youtube.com/watch?v=HqcGLJSORaA&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=14
// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/tweets", tweetRouter)

export { app }