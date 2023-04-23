const Joi = require("joi");
module.exports.schema = {
  body: Joi.object({
    //name of role
    name: Joi.string().required().trim(),
    show: Joi.array().items(Joi.string()).required(),
    permission: Joi.array().items(Joi.string()).required(),
  }),
  params: Joi.object({ id: Joi.number().required() }),
  query: {},
};
