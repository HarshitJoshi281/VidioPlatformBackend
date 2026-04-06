import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary = async (localFilePath)=>{
          try {
            if(!localFilePath) return null
            //Upload the file CLoudinary
           const response =await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })
            //file has been uploaded succesfully
           // console.log("File has been uploaded on cloudinary",response.url);
           fs.unlinkSync(localFilePath);
            return response;
            
          } catch (error) {
            fs.unlinkSync(localFilePath)// remove locally saved file from the server as the upload failed
            return null;
          }
    }
    export {uploadOnCloudinary}