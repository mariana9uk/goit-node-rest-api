import express from "express";
import { changeAvatar, createUser, getCurrentUserInfo, loginUser, logoutUser, upload } from "../controllers/authControllers.js";
import { checkTokenMiddleware } from "../helpers/middleware.js";


const authRouter = express.Router();


authRouter.post("/register", createUser)
authRouter.post("/login", loginUser)
authRouter.post("/logout", checkTokenMiddleware, logoutUser)
authRouter.get("/current", checkTokenMiddleware, getCurrentUserInfo)
authRouter.patch("/avatars", checkTokenMiddleware, upload.single("avatar"), changeAvatar)
authRouter.get("/verify/:verificationToken")
export default authRouter;
