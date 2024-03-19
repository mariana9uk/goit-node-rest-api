import Joi from "joi";

export const registrationSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required()

});

