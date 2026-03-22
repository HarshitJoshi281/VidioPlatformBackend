import { Router } from "express";
import { registerUSer } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js"


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
//router.route("/login").post(login)

export default router