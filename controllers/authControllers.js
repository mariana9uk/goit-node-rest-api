import { User } from "../models/user";
import { registrationSchema } from "../schemas/authSchema";

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
        const newUser = {
         
          email: req.body.email,
          password: req.body.password,
          
        };
        const responce= await User.create(newUser);
        res.status(201).json(responce);
      } catch (error) {
        next(error);
        console.log(error);
      }
    }
  };
  