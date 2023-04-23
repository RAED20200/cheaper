const Category = require("../../models/category.model");
require("../../models/relations");

const _ = require("lodash");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
//create
module.exports.create = async (req, res) => {
  try {
    let category = await Category.findOne({
      attributes: ["id"],
      where: {
        name: req.body.name.trim(),
      },
    });
    if (category) throw Error(`اسم الصنف موجود من قبل`);
    //create category in db
    await Category.create({ name: req.body.name.trim() });
    return res
      .status(StatusCodes.CREATED)
      .send({ success: true, msg: "تمت عملية الانشاء بنجاح" });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//update
module.exports.update = async (req, res) => {
  try {
    // console.log(12);
    let category = await Category.findByPk(req.params.id, {
      attributes: ["id"],
    });
    if (!category) throw Error(`رقم الصنف غير صحيح `);
    category = await Category.findOne({
      attributes: ["id"],

      where: { name: req.body.name, id: { [Op.not]: req.params.id } },
    });
    if (category) throw Error(`اسم الصنف موجود من قبل`);
    //create category in db
    await Category.update(
      { name: req.body.name.trim() },
      { where: { id: req.params.id } }
    );
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: `تمت عملية التحديث بنجاح ` });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//remove
module.exports.remove = async (req, res) => {
  //if remove category then => will delete for every user interests
  try {
    const category = await Category.findByPk(req.params.id, {
      attributes: ["id"],
    });
    if (!category) throw Error("رقم الصنف غير صحيح ");
    await category.destroy({ force: true });
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//get all category
module.exports.getAllCategory = async (req, res) => {
  try {
    let allCategory = await Category.findAll({
      raw: true,
      attributes: ["name", "id"],
    });
    res.status(StatusCodes.OK).send({ success: true, data: allCategory });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
