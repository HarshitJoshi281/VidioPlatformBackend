import { Router } from "express";
import { loginUser, logoutUSer, registerUSer,refreshAccessToken, changeCurrentpassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"
import { varifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();
router.route("/register").post(
    upload.fields([
        {
          name:"avatar",
          maxCount:1
        },
        {
           name:"coverImage",
          maxCount:1
        }
    ]),
    registerUSer
)
router.route("/login").post(loginUser)

//secure routes
router.route("/logout").post(varifyJWT, logoutUSer)
router.route("/refresh-tooken").post(refreshAccessToken)

router.route("/change-password").post(varifyJWT,changeCurrentpassword)
router.route("/current-user").get(varifyJWT,getCurrentUser)
router.route("/update-account").patch(updateAccountDetails)//patch just updte chnged details
router.route("/avatar").post(varifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").post(varifyJWT,upload.single("/coverImage"),updateCoverImage)
router.route("/c/:username").get(varifyJWT,getUserChannelProfile)
router.route("/history").get(varifyJWT,getWatchHistory)

export default router