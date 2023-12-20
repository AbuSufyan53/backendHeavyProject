//https://www.youtube.com/watch?v=S5EpsMjel-M&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=9 31:00
const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asyncHandler}




//try catch method
//https://www.youtube.com/watch?v=S5EpsMjel-M&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=9 45:00
/*const asyncHandler = (fn)=> async(err,req, res, next) => {
    try {
        await fn(err,req, res,next)
        
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
} 
*/