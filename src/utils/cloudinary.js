// https://www.youtube.com/watch?v=6KPXn2Ha0cM&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&index=12
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully 
        console.log("file has been uploaded on cloudinary "+response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the temporarily saved file as the upload operation failed
        return null
    }
}

// from the site
// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//     { public_id: "olympic_flag" },
//     function (error, result) { console.log(result); });

export {uploadOnCloudinary}