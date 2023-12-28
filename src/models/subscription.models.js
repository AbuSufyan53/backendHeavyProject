// https://www.youtube.com/watch?v=9azRerL6CZc&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=19
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId, //one who is subscribing
        ref: "User"
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId, //one whom subscriber is subscribing
        ref: "User"
    }
},{timestamps:true})



export const Subscription = mongoose.model("Subscription", subscriptionSchema)