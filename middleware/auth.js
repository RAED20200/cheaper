require("dotenv").config({
  path: `../.env`,
});

const { StatusCodes } = require("http-status-codes");
//very important to include
require("../models/relations");
const { verifyToken } = require("../utils/jwt");
const role = require("../models/role.model");
const user = require("../models/user.model");
const tokenTable = require("../models/tokenTable.model");
const store = require("../models/store.model");

module.exports.auth = async (req, res, next) => {
  try {
    let rawToken = req.headers.authorization;
    // console.log(token);
    if (!rawToken) throw Error("wrong token..! please try again ");

    if (rawToken.startsWith("Bearer "))
      rawToken = rawToken.replace("Bearer ", "");

    let decoded = verifyToken(rawToken);

    if (!decoded || !decoded.username)
      throw Error("wrong token..! please try again ");
    // console.log(decoded);
    let userInfo = await tokenTable.findOne({
      where: { token: rawToken.trim() },
      attributes: ["id"],
      include: {
        model: user,
        include: {
          model: role,
          attributes: { exclude: ["createdAt", "updatedAt"] },
        },
        where: { username: decoded.username.trim() },
      },
    });

    // console.log(userInfo);
    if (!userInfo)
      throw Error("JWT is not valid ,Please set the right token and try again");

    req.user = userInfo.user;
    req.role = userInfo.user.role.dataValues;

    next();
  } catch (err) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: err.message,
    });
  }
};
