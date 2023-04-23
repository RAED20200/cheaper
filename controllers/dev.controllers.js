const User = require("../models/user.model");
require("../models/relations");
const _ = require("lodash");
const { StatusCodes } = require("http-status-codes");
const category = require("../models/category.model");
const user = require("../models/user.model");

module.exports.checKUsername = async (req, res) => {
  try {
    if (
      await user.findOne({
        where: { username: req.body.username.trim() },
        attributes: ["id"],
      })
    )
      throw Error("اسم المستخدم موجود سابقا");

    res.status(StatusCodes.OK).send({ success: true });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};
module.exports.checKPhoneNumber = async (req, res) => {
  try {
    if (
      await user.findOne({
        where: { phoneNumber: req.body.phoneNumber.trim() },
        attributes: ["id"],
      })
    )
      throw Error("رقم الهاتف موجود سابقا");
    res.status(StatusCodes.OK).send({ success: true });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};
module.exports.checKEmail = async (req, res) => {
  try {
    if (
      await user.findOne({
        where: { email: req.body.email.trim() },
        attributes: ["id"],
      })
    )
      throw Error("لايميل موجود سابقا");

    res.status(StatusCodes.OK).send({ success: true });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};

module.exports.allCategory = async (req, res) => {
  try {
    let data = await category.findAll({ attributes: ["name"], raw: true });
    res.status(StatusCodes.OK).send({ success: true, data });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
