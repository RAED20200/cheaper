const banList = require("../../models/banList.model");
const banListUser = require("../../models/banListUser.model");
const User = require("../../models/user.model");
// const User = require("../../models/.model");

require("../../models/relations");
const _ = require("lodash");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
// const moment = require("moment");
const store = require("../../models/store.model");
//create ban list
module.exports.create = async (req, res) => {
  try {
    let ban = await banList.findOne({
      attributes: ["id"],
      where: {
        reason: req.body.reason.trim(),
      },
    });
    if (ban)
      throw Error(
        "نفس السبب موجود سابقا الرجاء القيام بتغيرالسبب ثم اجراء عملية الاضافة "
      );
    ///لازم امنعو من انو يدخل نوع حظر ل تسجيل الدخول التعديل على حسابه
    let dataJson = JSON.stringify(_.pick(req.body, "restrictions"));
    // console.log(dataJson);
    await banList.create({
      reason: req.body.reason,
      restrictions: dataJson,
      duration: req.body.duration,
    });
    res.status(StatusCodes.CREATED).send({
      success: true,
      msg: `تم إنشاء بنجاح`,
    });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//update  ban list
module.exports.update = async (req, res) => {
  try {
    let ban = await banList.findByPk(req.params.id, { attributes: ["id"] });
    if (!ban) throw Error("رقم غير صحيح ");

    ban = await banList.findOne({
      attributes: ["id"],

      where: {
        reason: req.body.reason.trim(),
        id: { [Op.not]: req.params.id },
      },
    });
    if (ban)
      throw Error(
        "السبب موجود سابقا الرجاء القيام بعملية تغير ثم اجراء عملية الاضافة"
      );

    let dataJson = JSON.stringify(_.pick(req.body, "restrictions"));

    await banList.update(
      {
        name: req.body.reason.trim(),
        restrictions: dataJson,
        duration: req.body.duration,
      },
      { where: { id: req.params.id } }
    );
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: `تمت عملية التحديث بنجاح` });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//remove  ban list
module.exports.remove = async (req, res) => {
  try {
    const ban = await banList.findByPk(req.params.id, { attributes: ["id"] });
    if (!ban) throw Error("رقم غير صحيح ");

    // if (req.params.id <= 5)
    //   throw Error("لا يمكنك حذف احدى الصلاحيات الاساسية الموجودة في النظام ");

    await ban.destroy({ force: true });
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//get all ban list
module.exports.getAll = async (req, res) => {
  try {
    let data = await banList.findAll({ raw: true });

    return res.status(StatusCodes.OK).send({ success: true, data });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//block manger store
module.exports.blockManger = async (req, res) => {
  try {
    if (!(await User.findByPk(req.body.userId, { attributes: ["id"] })))
      throw Error("رقم المستخدم غير صحيح");

    if (!(await banList.findByPk(req.body.banListId, { attributes: ["id"] })))
      throw Error("رقم نوع الحظر غير صحيح");

    let blocked = await banListUser.findOne({
      attributes: ["id"],
      where: {
        userId: req.body.userId,
        banListId: req.body.banListId,
      },
    });
    if (blocked) throw Error(`هذا المستخدم محظور مسبقا `);

    await banListUser.create({
      userId: req.body.userId,
      banListId: req.body.banListId,
    });
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحظر بنجاح " });
  } catch (err) {
    // console.log(err);
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//un block manger store
module.exports.unBlockManger = async (req, res) => {
  try {
    if (!(await User.findByPk(req.body.userId, { attributes: ["id"] })))
      throw Error("رقم المستخدم غير صحيح");

    if (!(await banList.findByPk(req.body.banListId, { attributes: ["id"] })))
      throw Error("رقم نوع الحظر غير صحيح");

    let blocked = await banListUser.findOne({
      attributes: ["id"],
      where: {
        userId: req.body.userId,
        banListId: req.body.banListId,
      },
    });
    if (!blocked) throw Error(`هذا المستخدم غير محظور من نوع الحظر هذا `);

    await blocked.destroy();
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت ازالة الحظر بنجاح " });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//un block every blocks for this manger store
module.exports.unBlockAllForManger = async (req, res) => {
  try {
    if (!(await User.findByPk(req.params.id, { attributes: ["id"] })))
      throw Error("رقم مدير المتجر غير صحيح");

    let allBlocked = await banListUser.findAll({
      attributes: ["id"],
      where: { userId: req.params.id },
    });
    // console.log(allBlocked);
    if (allBlocked.toString() == [])
      throw Error("لا يوجد اي نوع من الحظر على مدير المحل هذا ");
    allBlocked.forEach(async (e) => await e.destroy());
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت ازالة جميع انواع الحظر بنجاح " });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//records Blocked for manger store
module.exports.allBlockRecordManger = async (req, res) => {
  try {
    let user = await User.findByPk(req.params.id, {
      attributes: ["email", "phoneNumber1", "username"],
      raw: true,
    });
    if (!user) throw Error("رقم مدير المتجر غير صحيح");
    let result = { active: [], notActive: [] };
    let allBlocked = await banListUser.findAll({
      where: { userId: req.params.id },
      attributes: { exclude: ["id", "userId", "banListId"] },
      include: {
        model: banList,
        required: true,
        attributes: ["reason", "duration"],
      },
      paranoid: false,
      raw: true,
    });
    // console.log(allBlocked);
    allBlocked.forEach((e) => {
      e.user = user;
      if (e.unblock_date) result.notActive.push(e);
      else result.active.push(e);
    });
    return res.status(StatusCodes.OK).send({ success: true, data: result });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//remove records Blocked for manger store
module.exports.removeAllBlockRecord = async (req, res) => {
  try {
    if (!(await User.findByPk(req.params.id, { attributes: ["id"] })))
      throw Error("رقم مدير المتجر غير صحيح");

    let allBlocked = await banListUser.findAll({
      attributes: ["unblock_date"],

      where: { userId: req.params.id },
      paranoid: false,
    });
    if (allBlocked.toString() == [])
      throw Error("لا يوجد اي نوع من الحظر على مدير المحل هذا ");
    let check = allBlocked.every((e) => (e.unblock_date ? false : true));

    if (check) throw Error("لا يوجد اي سجلات محظورة  منتهية مدير المحل ");
    allBlocked.forEach(async (e) => {
      if (e.unblock_date) await e.destroy({ force: true });
    });
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت ازالة جميع سجلات الحظر بنجاح " });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//all Block Record every mangers store
module.exports.allBlockRecordEvery = async (req, res) => {
  try {
    let allStore = await banListUser.findAll({
      raw: true,
      attributes: { exclude: ["id", "userId", "banListId"] },
      include: [
        {
          model: User,
          required: true,

          include: {
            model: store,
            required: true,
            attributes: ["nameStore", "avatar", "longitude", "latitude"],
          },
          attributes: ["email", "phoneNumber1", "username"],
        },
        { model: banList, attributes: ["reason", "duration"] },
      ],
    });

    allStore = allStore.map((e) => _.omit(e, ["user.stores.id"]));

    return res.status(StatusCodes.OK).send({ success: true, data: allStore });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
