const Joi = require("joi");
module.exports.schema = {
  body: {
    get_spams: Joi.object({
      nameStore: Joi.string().required().trim(),
    }),
  },
  params: Joi.object({ id: Joi.number().required() }),
  query: {},
};
