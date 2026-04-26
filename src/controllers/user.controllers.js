import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefereshToken=async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return{accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Somthing went wrong while creating Refresh and acces token")
    }
}

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

    const existedUSer= await User.findOne(
        {
            $or: [{username},{email}]
        }
    )
    if(existedUSer){
        throw new ApiError(409,"User with email or username exist")
    }

     const avatarLocalPath=  req.files?.avatar?.[0]?.path
     const coverImageLocalPath= req.files?.coverImage?.[0]?.path

     console.log("FILES:", req.files);

     if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar requireddd")
     }

    const avatar= await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
      
    if(!avatar){
        throw new ApiError(400,"Avatar required")
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

const loginUser = asyncHandler(async(req,res)=>{
      // bring data from req body
      //username or email
      //find the user 
      //check password
      //access and refresh token
      //send cookeie
      const {email,username,password} = req.body
      if (!(username||email)) {
        throw new ApiError(400,"username or email required")
      }
     const user = await User.findOne({
        $or:[{username},{email}]
      })
      if(!user){
        throw new ApiError(404,"User never existed")
      }
      const isPasswordVAlid = await user.isPasswordCorrect(password)
      if(!isPasswordVAlid){
        throw new ApiError(401,"Password incorrect");
      }

      const {accessToken,refreshToken} = await generateAccessAndRefereshToken(user._id)
      
      const loggedInUser= await User.findById(user._id).select("-password -refreshToken")
      const options={
        httpOnly:true,
        secure:true
      }

      return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
      .json(
        new ApiResponce(200,{
            user: loggedInUser,accessToken,refreshToken
        },
        "User loggedin Succesfully"
    )
      )
})

const logoutUSer = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken:undefined
            }
            },
            {
                new:true
            }

        
    )
     const options={
        httpOnly:true,
        secure:true
      }
      return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponce,{},"User logedOut Successfully")

})

const refreshAccessToken  = asyncHandler(async(req,res)=>{
    const incomingRefrehToken=req.cookie.refreshToken||req.body.refreshToken
    if(!incomingRefrehToken){
        throw new ApiError(401,"Unathorised access")
    }
    const decodedToken = jwt.varify(
        incomingRefrehToken,
        process.envACCESS_TOKEN_SECRET
    )

   const user =  User.findById(decodedToken?._id)
   if(!user){
    throw new ApiError(401,"Invalid refresh Token")
   }

   if(incomingRefrehToken!= user?.refreshToken){
    throw new ApiError(401,"Invaid refreshToken ")
   }

   const options= {
    httpOnly:true,
    secure:true
   }
   
   const {accessToken,newRefreshTokenefreshToken}=await generateAccessAndRefereshToken(user._id)

   return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options).json(
        new ApiResponce(
            200,{
                accessToken,refreshToken:newRefreshToken
            },
            "AccessToken refresed succesfully"
        )
   )




})

const changeCurrentpassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;

    const user = await User.findById(req.user?._id)

    const isPassWord = await user.isPasswordCorrect(oldPassword)

    if(!isPassWord){
       throw new ApiError(400,"old password incorrect")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponce(200,{},"Password Change Successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=> {
    return res.status(200).json(new ApiResponce(200,req.user,"current User fetched succesfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body
    if(!fullName || !email){
        throw new ApiError(400,"All field required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
          $set:{
            fullname,
            email:email//we can use any method
          }
    },{new:true}
).select("-password")

     return res.status(200).json(new ApiResponce(200,user,"Account details updated successfully"))

})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Upload Local Path")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
     if(!avatar.url){
        throw new ApiError(400,"Error while uploading Avatar")
     }

     const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar:avatar.url
        }
     },{new :true}).select("-password")

     return res.status(200).json(new ApiResponce(200,user,"Avatar Changed Successfully"))
})

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    
    if(!coverImageLocalPath){
        throw new ApiError(400,"Upload Local Path")
    }
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     if(!coverImage.url){
        throw new ApiError(400,"Error while uploading coverImage")
     }

     const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage:coverImage.url
        }
     },{new :true}).select("-password")

     return res.status(200).json(new ApiResponce(200,user,"coverImage Changed Successfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
      const {username} = req.params
       if(!username?.trim()){
        throw new ApiError(400,"username is missing")
       }

       const channel = await User.aggregate([{
        $match:{
            username:username?.toLowerCase()
        }
       },
       {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
       },
       {
        $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",//tell how many channel i subscribed
            as:"subscribedTo"
        }
       },
       {
        $addFields:{
              subscriberCount:{
                    $size:"$subscribers"
              },
              channelSubcribedToCount:{
                 $size:"$subscribedTo"
              },
              isSubscribed:{
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
              }
        }
       },
       {
        $project:{
            fullName:1,
            userName:1,
            subscriberCount:1,
            channelSubcribedToCount:1,
            isSubscribed:1,
            coverImage:1,
            email:1
        }
       }
    ])

    if(!channel?.length){
        throw new ApiError(400,"channel does not exist")
    }
    return res.status(200).json(
        new ApiResponce(200,channel[0],"user channel fetched sucefully")
    )
    
})
export {registerUSer,loginUser,getUserChannelProfile,logoutUSer,refreshAccessToken,changeCurrentpassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateCoverImage}