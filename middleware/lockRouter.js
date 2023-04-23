const { StatusCodes } = require("http-status-codes");
const banList = require("../models/banList.model");
const banListUser = require("../models/banListUser.model");
module.exports.lockRouter = (permission) => {
  return async (req, res, next) => {
    try {
      let allBans = await banListUser.findAll({
        where: { userId: req.user.id },
        attributes: [],
        include: {
          model: banList,
          attributes: { exclude: ["id", "duration"] },
        },
        raw: true,
      });

      for (let ban of allBans) {
        let allRestrictions = JSON.parse(
          ban["banList.restrictions"]
        ).restrictions;
        if (allRestrictions.includes(permission))
          throw Error(ban["banList.reason"]);
      }
      next();
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: err.message,
      });
    }
  };
};
