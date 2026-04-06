import { Router } from "express";
import { loginUser, logoutUSer, registerUSer } from "../controllers/user.controllers.js";
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

export default router