const Stores = require("../../models/store.model");
const Category = require("../../models/category.model");

const { StatusCodes } = require("http-status-codes");
const store = require("../../models/store.model");
const user = require("../../models/user.model");
const _ = require("lodash");
const category = require("../../models/category.model");
require("../../models/relations");

//get all stores
module.exports.getAllStore = async (req, res) => {
  try {
    let result = { active: [], notActive: [] };
    let allStore = await Stores.findAll({
      paranoid: false,
      raw: true,
      include: {
        model: Category,
        required: true,
        attributes: ["name"],
      },
    });

    allStore.forEach((e) => {
      e = _.omit(e, ["userId", "categoryId"]);
      if (e.disableAt) {
        //not Active
        result.notActive.push(e);
      } else {
        //Active
        e = _.omit(e, ["disableAt"]);
        result.active.push(e);
      }
    });
    res.status(StatusCodes.OK).send({ success: true, data: result });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

module.exports.getAllNew = async (req, res) => {
  try {
    let data = await store.findAll({
      attributes: [
        "nameStore",
        "avatar",
        "fromHour",
        "toHour",
        "longitude",
        "latitude",
        "id",
      ],

      include: {
        model: user,
        required: true,
        attributes: ["name", "email", "phoneNumber", "username"],
        where: { roleId: 3 },
      },
    });
    res.status(StatusCodes.OK).send({ success: true, data });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

module.exports.acceptStore = async (req, res) => {
  try {
    let myStore = await store.findOne({
      attributes: [],
      where: { nameStore: req.body.name.trim() },
      include: {
        model: user,
        required: true,
        attributes: ["id"],
        required: true,
      },
    });
    if (!myStore) throw Error("اسم المحل المدخل غير صحيح ");

    if (myStore.user.id == 4) throw Error("هذا المتجر مقبول مسبقا");

    await user.update({ roleId: 4 }, { where: { id: myStore.user.id } });

    res.status(StatusCodes.OK).send({ success: true });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

module.exports.deleteStore = async (req, res) => {
  try {
    let ans = await store.destroy({
      where: { nameStore: req.body.name.trim() },
    });

    if (!ans) throw Error("اسم المحل المدخل غير صحيح ");

    res.status(StatusCodes.OK).send({ success: true });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
