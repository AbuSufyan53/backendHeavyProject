import mongoose, {Schema} from "mongoose"
import jwt  from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index: true
    },
    avatar:{
        type:String,
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
        }
    ],
    password:{
        type:String,
        required: [true, "Password Is Required"]
    },
    refreshToken:{
        type: String
    }
        
    
},{timestamps:true})

// https://www.youtube.com/watch?v=eWnZVUXMq8k&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=12 30:00
userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password = bcrypt.hash(this.password, 8)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password) // it return true or false
}


// https://www.youtube.com/watch?v=eWnZVUXMq8k&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=12 45:00
// JWT
// accesstoken
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}

// refresh token
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}
// JWT END

userSchema.methods.generateAccessToken = async function(){

}



export const User = mongoose.model("User", userSchema)
