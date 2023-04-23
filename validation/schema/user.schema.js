const Joi = require("joi");
module.exports.schema = {
  body: {
    addSpam: Joi.object({
      reason: Joi.string().required().trim(),
    }),
    gift: Joi.object({
      username: Joi.string()
        .trim()
        .pattern(/[a-zA-Z]+[a-zA-Z0-9\_\.]*$/)
        .min(3)
        .max(30)
        .required(),
    }),
  },
  params: Joi.object({ id: Joi.number().required() }),
};
