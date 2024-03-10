import { User } from "../models/user.js";
import { registrationSchema } from "../schemas/authSchema.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import multer from "multer";
import path from "node:path"

export const createUser = async (req, res, next) => {
  const check = registrationSchema.validate(req.body, { abortEarly: false });
  const { error } = check;

  if (error) {
    const missingFields = error.details
      .filter((detail) => detail.type === "any.required")
      .map((detail) => detail.context.key);
    if (missingFields.length > 0) {
      res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
  else {
    try {
      const { email, password } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);
      const existingUser = await User.findOne({ email });
      if (existingUser != null) {
        return res.status(409).json({ message: "Email in use" });
      }
      const responce = await User.create({ email, password: passwordHash });

      res
        .status(201)
        .json({ email: responce.email, subscription: responce.subscription });
      console.log("Sucsess");
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
};

export const loginUser = async (req, res, next) => {
  const check = registrationSchema.validate(req.body, { abortEarly: false });
  const { error } = check;

  if (error) {
    const missingFields = error.details
      .filter((detail) => detail.type === "any.required")
      .map((detail) => detail.context.key);

    if (missingFields.length > 0) {
      res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  } else {
    try {
      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });
      console.log(existingUser);
      if (existingUser === null) {
           return res
          .status(401)
          .send({ message: "Email Email or password is wrong" });
      }
      const isMatch = await bcrypt.compare(password, existingUser.password);
      
      if (isMatch === false) {
        return res
          .status(401)
          .send({ message: "Email Email or password is wrong" });
      }
      const token = jsonwebtoken.sign(
        { id: existingUser._id },
        process.env.JWT_KEY,
        { expiresIn: 60 * 60 }
      );
      await User.findByIdAndUpdate(existingUser._id, { token });
      res.status(200).send({
        token: token,
        user: {
          email: existingUser.email,
          subscription: existingUser.subscription,
        },
      });
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const existingUser = await User.findByIdAndUpdate(req.user.id, {
      token: null,
    });
    if (existingUser === null) {
      return res.status(401).send({ message: "Not authorized" });
    }
    res.status(204).send()
  } catch (error) {
    next(error);
    console.log(error);
  }
};

export const getCurrentUserInfo = async (req, res, next) => {
  try {
    const existingUser = await User.findById(req.user.id);
    console.log(req.user.id)
    if (existingUser === null) {
      return res.status(401).send({ message: "Not authorized" });
    }
    res
      .status(200)
      .send({
        email: existingUser.email,
        subscription: existingUser.subscription,
      });
  } catch (error) {
    next(error);
    console.log(error);
  }
};


const tempDir=path.join("..", "goit-node-rest-api","temp")
const multerConfig=multer.diskStorage({
  destination: tempDir
})
const upload = multer({storage:multerConfig})

export const changeAvatar=async(req, res, next)=>{
try {
  // const avatar=
} catch (error) {
  next(error);
  console.log(error);
}
}