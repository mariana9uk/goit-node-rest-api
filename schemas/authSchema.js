import Joi from "joi";

export const registrationSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
 
});

// export const loginSchema = Joi.object({
//   email: Joi.string().email().required(),
//   password: Joi.string().required(),

// });