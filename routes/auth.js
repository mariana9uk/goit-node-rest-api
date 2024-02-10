import express from "express";
import { createUser, loginUser } from "../controllers/authControllers.js";


const authRouter = express.Router();



authRouter.post("/register", createUser)
authRouter.post("/login", loginUser)
export default authRouter;
