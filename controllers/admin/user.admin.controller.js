const Users = require("../../models/user.model");
require("../../models/relations");
const { StatusCodes } = require("http-status-codes");
const _ = require("lodash");
const Roles = require("../../models/role.model");
const Store = require("../../models/store.model");
const StoreStory = require("../../models/storeStory.model");
const Category = require("../../models/category.model");
const category = require("../../models/category.model");
const user = require("../../models/user.model");
const store = require("../../models/store.model");
const { Op } = require("sequelize");

/*
///basic roles in system :
  1 Admin 
  2 User
  3 Manger saved
  4 Manger new 
  5 manger country 
#this roles can't any one edit or delete them 
#but other role can edit on it 
*/

//get all account
module.exports.getAllUsers = async (req, res) => {
  try {
    let result = { active: [], notActive: [] };
    let allUser = await Users.findAll({
      raw: true,
      paranoid: false,
      attributes: { exclude: ["roleId", "password", "access_token"] },
      include: {
        model: Roles,
        required: true,
        attributes: ["name"],
      },
    });
    allUser.forEach((e) => {
      if (!e.disableAt) {
        e.disableAt = undefined;
        result.active.push(e);
      } else result.notActive.push(e);
    });
    return res.status(StatusCodes.OK).send({ success: true, data: result });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

module.exports.getMoreDetails = async (req, res) => {
  try {
    if (!req.params.id) throw Error("يجب ان يوجد رقم مستخدم");
    let user = await Users.findOne({
      attributes: ["roleId", "id"],
      where: { id: req.params.id },
      include: { model: category, required: true, required: true },
    });

    if (!user || user.roleId == 1) throw Error("رقم المستخدم خاطئ");
    let details = {};
    let store = null;
    switch (user.roleId) {
      case 2:
        //normal user
        let category = await user.getCategories({
          raw: true,
          attributes: ["name"],
        });
        details = category.map((e) => _.pick(e, "name"));
        break;
      case 3:
      case 4:
        //manger store
        store = await Store.findOne({
          where: { userId: user.id },
          raw: true,
          attributes: { exclude: ["userId", "categoryId"] },
          include: { model: Category, required: true, attributes: ["name"] },
        });
        details.storeInfo = _.omit(store, ["id"]);
        details.storeStory = await StoreStory.findAll({
          raw: true,
          where: { storeId: store.id },
          attributes: ["avatar"],
        });
        break;
      case 5:
        //if manger country
        break;
    }
    res.status(StatusCodes.OK).send({ success: true, data: details });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

module.exports.search = async (req, res) => {
  try {
    let myUser = await user.findOne({
      where: { username: { [Op.like]: `%${req.body.username.trim()}%` } },
      attributes: { exclude: ["password"] },
      raw: true,
    });
    if (!myUser) throw Error("اسم المستخدم غير صحيح ");
    // console.log(myUser);
    let storeInfo = null;
    if (myUser.roleId == 3) {
      // console.log(1);
      storeInfo = await store.findOne({
        attributes: { exclude: ["userId"] },
        order: [["nameStore", "ASC"]],
        where: { userId: myUser.id },
        include: {
          model: category,
          attributes: ["name"],
          required: true,
        },
      });
    }

    res.status(StatusCodes.OK).send({ success: true, data: myUser, storeInfo });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
