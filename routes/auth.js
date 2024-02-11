import express from "express";
import { createUser, getCurrentUserInfo, loginUser, logoutUser } from "../controllers/authControllers.js";
import { checkTokenMiddleware } from "../helpers/middleware.js";


const authRouter = express.Router();


authRouter.post("/register", createUser)
authRouter.post("/login", loginUser)
authRouter.post("/logout", checkTokenMiddleware, logoutUser)
authRouter.get("/current", checkTokenMiddleware, getCurrentUserInfo)
export default authRouter;
