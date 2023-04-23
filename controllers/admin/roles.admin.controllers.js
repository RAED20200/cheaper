const Role = require("../../models/role.model");
require("../../models/relations");
const _ = require("lodash");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");

/*
///basic roles in system :
  1 Admin 
  2 User
  3 Manger new 
  4 Manger saved
  5 manger country 
#this roles can't any one edit or delete them 
#but other role can edit on it 
*/
//create role
module.exports.create = async (req, res) => {
  try {
    let role = await Role.findOne({
      attributes: ["id"],
      where: {
        name: req.body.name.trim(),
      },
    });
    if (role) throw Error("اسم الدور موجود مسبقا في القائمة ");

    let dataJson = JSON.stringify(_.omit(req.body, "name"));
    await Role.create({ name: req.body.name.trim(), data: dataJson });
    res.status(StatusCodes.CREATED).send({
      success: true,
      msg: `تم إنشاء الدور بنجاح`,
    });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//update roles
module.exports.update = async (req, res) => {
  try {
    let role = await Role.findByPk(req.params.id, { attributes: ["id"], s });
    if (!role) throw Error("رقم الصلاحية غير صحيح ");

    if (req.params.id <= 5)
      throw Error(
        "لا يمكنك التعديل على الصلاحيات الاساسية الموجودة في النظام "
      );

    role = await Role.findOne({
      attributes: ["id"],

      where: { name: req.body.name.trim(), id: { [Op.not]: req.params.id } },
    });
    if (role) throw Error("اسم الدرو موجود من قبل ");

    let dataJson = JSON.stringify(_.omit(req.body, "name"));

    await Role.update(
      { name: req.body.name.trim(), data: dataJson },
      { where: { id: req.params.id } }
    );
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: `تمت عملية التحديث بنجاح` });
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
    const role = await Role.findByPk(req.params.id, { attributes: ["id"] });
    if (!role) throw Error("رقم الصلاحية غير صحيح ");
    //always 1 is admin
    if (req.params.id <= 5)
      throw Error("لا يمكنك حذف احدى الصلاحيات الاساسية الموجودة في النظام ");

    await role.destroy({ force: true });
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//get all role
module.exports.getAllRole = async (req, res) => {
  try {
    let data = await Role.findAll({ raw: true });
    res.status(StatusCodes.OK).send({ success: true, data });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
