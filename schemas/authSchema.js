import Joi from "joi";

export const registrationSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),

});

export const updateContactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.number(),
  favorite: Joi.boolean(),
});