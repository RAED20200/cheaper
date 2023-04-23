const Joi = require("joi");
module.exports.schema = {
  body: {
    update: Joi.object({
      name: Joi.string().required().min(2).max(50).trim(),
      gender: Joi.boolean().default(true).required(),
      birthday: Joi.date().required(),
      username: Joi.string()
        .trim()
        .pattern(/[a-zA-Z]+[a-zA-Z0-9\_\.]*$/)
        .min(3)
        .max(30)
        .required(),
      category: Joi.array().items(Joi.string().trim()),
      avatar: Joi.string().allow(null),
    }),
    //disable or delete or check if user here
    category: Joi.object({
      //array of the category
      category: Joi.array().items(Joi.string().trim()).required(),
    }),
    ch_phon: Joi.object({
      phoneNumber: Joi.string().required().trim(),
    }),
    ch_email: Joi.object({
      newEmail: Joi.string()
        .required()
        .trim()
        .pattern(/[a-zA-Z0-9\_\.]+(@gmail\.com)$/),
      password: Joi.string().required(),
    }),
    verify_email: Joi.object({
      newEmail: Joi.string()
        .required()
        .trim()
        .pattern(/[a-zA-Z0-9\_\.]+(@gmail\.com)$/),
      code: Joi.string()
        .pattern(/(\d{6})$/)
        .trim()
        .required(),
    }),
    changePassword: Joi.object({
      password: Joi.string().required().min(8).max(50),
      newPassword: Joi.string().required().min(8).max(50),
    }),
  },
};
