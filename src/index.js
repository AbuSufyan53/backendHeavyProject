import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
})

connectDB()
.then(()=>{
    app.on("error", (error)=>{
        console.log("ERROR: " + error)
        throw error
    })
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`⚙️  Server is running at port:${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log(`MONGODB ERROR, CONNECTION FAILED: ${error}`)
})










// first approach to connent database
/*import express from "express"
const app = express()

;( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}` );
        app.on("error", (error)=>{
            console.log("ERROR: " + error)
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on Port ${process.env.PORT}`)
        })
    } catch (error) {
        console.log(error)
        throw error
    }

})()
*/