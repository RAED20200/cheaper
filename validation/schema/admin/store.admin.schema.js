const Joi = require("joi");
module.exports.schema = {
  body: Joi.object({
    name: Joi.string().required().min(3).max(50).trim(),
  }),
  params: {
    idJust: Joi.object({ id: Joi.number().required() }),
  },
  query: {},
};
