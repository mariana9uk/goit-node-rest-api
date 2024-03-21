import Joi from "joi";

export const registrationSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required()

});
export const resendEmailSchema = Joi.object({
  email:Joi.string().email().required()
})

