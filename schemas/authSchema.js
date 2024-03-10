import Joi, { string } from "joi";

export const registrationSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
 avatarURL: string,
});

