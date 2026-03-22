import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponse.js";

const registerUSer = asyncHandler(async(req,res)=>{

    //get user detail from frontend
    //vaildation not empty
    //check if user already exist
    //check for images,check for avtar
    //upload them to cloudinary
    //create user object in db
    //remove password and refresh token from response
    //check for user cration 
    //return res
    const {fullname,email,password,username}= req.body
    console.log("email:",email)
    
    if ([fullname,email,password,username].some((field)=>
        field?.trim()===""
    )) {
        throw new ApiError(400,"All fields are required");
    }

    const existedUSer= User.findOne(
        {
            $or: [{username},{email}]
        }
    )
    if(existedUSer){
        throw new ApiError(409,"User with email or username exist")
    }

     const avatarLocalPath=req.files?.avatar[0]?.path
     const coverImageLocalPath=req.files?.coverImage[0]?.path

     if (!avatarLocalPath) {
        throw ApiError(400,"Avatar required")
     }

    const avatar= await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
      
    if(!avatar){
        throw ApiError(400,"Avatar required")
    }
   const user= await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refershToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering a user")
    }

    // one way return res.status(201).json({createdUser})
    //by using structured api we have crated 
    return res.status(201).json(
        new ApiResponce(200,createdUser,"User Registered Succefully")
    )


})
export {registerUSer}