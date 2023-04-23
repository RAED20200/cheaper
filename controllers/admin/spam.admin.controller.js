const spams = require("../../models/spams.model");
const moment = require("moment");
const store = require("../../models/store.model");
const { StatusCodes } = require("http-status-codes");
const user = require("../../models/user.model");
const { Sequelize } = require("sequelize");
const offer = require("../../models/offer.model");

module.exports.AllSpamsForStore = async (req, res) => {
  try {
    let allSpams = await spams.findAll({
      attributes: ["reason", ["createdAt", "dateAt"], "id"],
      include: [
        {
          model: user,
          required: true,
          attributes: ["name", "username", "phoneNumber", "gender", "birthday"],
        },
        {
          model: offer,
          required: true,
          include: {
            model: store,
            attributes: [],
            required: true,
            where: { nameStore: req.body.nameStore.trim() },
          },
          attributes: [],
        },
      ],
    });

    res.status(StatusCodes.OK).send({ success: true, data: allSpams });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
module.exports.AllStoreAndCount = async (req, res) => {
  try {
    let all = await spams.findAll({
      include: {
        model: offer,
        attributes: ["id"],
        required: true,
        include: {
          model: store,
          required: true,
          attributes: ["nameStore", "avatar", "latitude", "longitude"],
        },
      },
      attributes: [[Sequelize.fn("count", Sequelize.col("offerId")), "count"]],
      group: ["offerId"],
    });

    res.status(StatusCodes.OK).send({ success: true, data: all });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
