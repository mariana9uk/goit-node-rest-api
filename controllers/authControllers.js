import { User } from "../models/user.js";
import {
  registrationSchema,
  resendEmailSchema,
} from "../schemas/authSchema.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import multer from "multer";
import path from "node:path";
import gravatar from "gravatar";
import fs from "node:fs/promises";
import Jimp from "jimp";
import { nanoid } from "nanoid";
import sgMail from "@sendgrid/mail";

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
  } else {
    try {
      const { email, password } = req.body;
      const passwordHash = await bcrypt.hash(password, 10);
      const existingUser = await User.findOne({ email });
      if (existingUser != null) {
        return res.status(409).json({ message: "Email in use" });
      } else {
        const address = String(email).trim().toLowerCase();
        const avatarURL = gravatar.url(address);
        const verificationToken = nanoid();
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: email,
          from: "maryanagolyuk@gmail.com",
          subject: "Verification link",
          text: `Please use this link to verify: http://localhost:3000/api/users/verify/${verificationToken}`,
          html: `Please use this link to verify: <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a>`,
        };
        try {
          await sgMail.send(msg);
          console.log("Email sent");
        } catch (error) {
          console.error(error);
        }
        const responce = await User.create({
          email,
          password: passwordHash,
          avatarURL,
          verificationToken,
        });
        res.status(201).json({
          email: responce.email,
          subscription: responce.subscription,
          verificationToken: responce.verificationToken,
        });
      }
    } catch (error) {
      next(error);
      console.log(error);
    }
  }
};

///login user///
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
      if (existingUser.verify === false) {
        return res.status(401).send({ message: "Not verified" });
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
      res.status(500).send("Internal Server Error")
      console.log(error);
    }
  }
};

///logout///
export const logoutUser = async (req, res, next) => {
  try {
    const existingUser = await User.findByIdAndUpdate(req.user.id, {
      token: null,
    });
    if (existingUser === null) {
      return res.status(401).send({ message: "Not authorized" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
    console.log(error);
  }
};

///current user///
export const getCurrentUserInfo = async (req, res, next) => {
  try {
    const existingUser = await User.findById(req.user.id);
    console.log(req.user.id);
    if (existingUser === null) {
      return res.status(401).send({ message: "Not authorized" });
    }
    res.status(200).send({
      email: existingUser.email,
      subscription: existingUser.subscription,
    });
  } catch (error) {
    next(error);
    console.log(error);
  }
};
const tempDir = path.join("..", "goit-node-rest-api", "temp");
const multerConfig = multer.diskStorage({
  destination: tempDir,
});
export const upload = multer({ storage: multerConfig });
const avatarDir = path.join("..", "goit-node-rest-api", "public", "avatars");

///avatar changing///
export const changeAvatar = async (req, res, next) => {
  const { id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${id}${originalname}`;
  const resultUpload = path.join(avatarDir, filename);
  try {
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    console.log(avatarURL);
    await Jimp.read(resultUpload)
      .then((image) => {
        image.resize(250, 250).write(resultUpload);
      })
      .catch((err) => {
        console.log(err);
      });
    await User.findByIdAndUpdate(id, { avatarURL });
    res.json({ avatarURL });
  } catch (error) {
    next(error);
    console.log(error);
  }
};

///verification by link///
export const verify = async (req, res, next) => {
  const { verificationToken } = req.params;
  const existingUser = await User.findOne({
    verificationToken: verificationToken,
  });
  if (existingUser === null) {
    return res.status(404).send({ message: "User not found" });
  }
  await User.findByIdAndUpdate(existingUser._id, {
    verify: true,
    verificationToken: null,
  });
  res.status(204).send("Verification successful");
};

///resend verification email///
export const resendVerificationEmail = async (req, res, next) => {
  const check = resendEmailSchema.validate(req.body);
  const { error } = check;
  const { email } = req.body;
  if (error) {
    return res.status(400).send({ message: "missing required field email" });
  }
  const existingUser = await User.findOne({ email: email });
  if (existingUser.verify === true) {
    return res
      .status(400)
      .send({ message: "Verification has already been passed" });
  } else {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email,
      from: "maryanagolyuk@gmail.com",
      subject: "Verification link",
      text: `Please use this link to verify: http://localhost:3000/api/users/verify/${existingUser.verificationToken}`,
      html: `Please use this link to verify: <a href="http://localhost:3000/api/users/verify/${existingUser.verificationToken}">link</a>`,
    };
    try {
      await sgMail.send(msg);
      res.status(200).send({ message: "Verification email sent" });
      console.log("Email sent");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error")
    }
  }
};
