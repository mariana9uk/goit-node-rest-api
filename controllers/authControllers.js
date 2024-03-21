import { User } from "../models/user.js";
import { registrationSchema, resendEmailSchema } from "../schemas/authSchema.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import multer from "multer";
import path from "node:path";
import gravatar from "gravatar";
import fs from "node:fs/promises";
import Jimp from "jimp";
import nanoid from "nanoid";
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
      console.log(email);
      const passwordHash = await bcrypt.hash(password, 10);
      const existingUser = await User.findOne({ email });
      if (existingUser != null) {
        return res.status(409).json({ message: "Email in use" });
      }
      const address = String(email).trim().toLowerCase();
      console.log(address);
      const avatarURL = gravatar.url(address);
      const verificationToken = nanoid();
        const responce = await User.create({
        email,
        password: passwordHash,
        avatarURL,
        verificationToken,
      });
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: `${email}`,
        from: "maryanagolyuk@gmail.com", 
        subject: "Verification link",
        text:`/users/verify/:${verificationToken}`,
        };
      await sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent");
        })
        .catch((error) => {
          console.error(error);
        });
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
      const{verify}=req.user
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
      if (verify===false) {
        return res.status(401).send({ message: "Not verified" }) 
      }
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
    res.status(204).send();
  } catch (error) {
    next(error);
    console.log(error);
  }
};

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
console.log(tempDir);
const multerConfig = multer.diskStorage({
  destination: tempDir,
});
export const upload = multer({ storage: multerConfig });

const avatarDir = path.join("..", "goit-node-rest-api", "public", "avatars");

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


export const verify = async (req, res, next) => {
  const { verificationToken} = req.params;
  const existingUser = await User.findOneAndUpdate(verificationToken, {
    verify: true,
    verificationToken: null,
  });
  console.log(existingUser);
  if (existingUser === null) {
    return res.status(404).send({ message: "User not found" });
  }

  res.status(204).send("Verification successful");
};


export const resendVerificationEmail = async (req, res, next) => {
  const check = resendEmailSchema.validate(req.body);
  const { error } = check;

  if (error) {
    return
  }
 const {email} = res.body

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: `${email}`,
    from: "maryanagolyuk@gmail.com", 
    subject: "Verification link",
    text:`/users/verify/:${verificationToken}`,
    };
  await sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });

 
};
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: "test@example.com", // Change to your recipient
//   from: "test@example.com", // Change to your verified sender
//   subject: "Sending with SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong>",
// };
// await sgMail
//   .send(msg)
//   .then(() => {
//     console.log("Email sent");
//   })
//   .catch((error) => {
//     console.error(error);
//   });