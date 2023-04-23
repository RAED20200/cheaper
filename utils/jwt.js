const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: "../.env",
});
const moment = require("moment");

module.exports.verifyToken = (token) =>
  jwt.verify(token, process.env.SECRET_KEY);

module.exports.createToken = (req, payload) =>
  jwt.sign(
    {
      ...payload,
      ipAddress: req.ip,
      startTime: new Date(),
      expiresAt: moment().add(90, "days").calendar(),
    },
    process.env.SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
module.exports.createQROffer = (payload) =>
  jwt.sign(
    {
      ...payload,
      startTime: new Date(),
      expiresAt: moment().add(2, "days").calendar(),
    },
    process.env.SECRET_KEY_OFFER,
    {
      expiresIn: "2d",
    }
  );
module.exports.verifyQROffer = (token) =>
  jwt.verify(token, process.env.SECRET_KEY_OFFER);

module.exports.checkTokenValidity = (token) => {
  const now = Date.now();
  if (now > token.expiresAt)
    // توكن منتهي الصلاحية
    return false;

  // توكن ساري المفعول
  return true;
};
