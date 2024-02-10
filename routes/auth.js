import express from "express";
import { createUser, loginUser, logoutUser } from "../controllers/authControllers.js";
import { checkTokenMiddleware } from "../helpers/middleware.js";


const authRouter = express.Router();


authRouter.post("/register", createUser)
authRouter.post("/login", loginUser)
authRouter.post("/logout", checkTokenMiddleware, logoutUser)
authRouter.post("/current", loginUser)
export default authRouter;
