const { Op } = require("sequelize");
const offer = require("../models/offer.model");
const packsStore = require("../models/packsStore.model");
const store = require("../models/store.model");
const { StatusCodes } = require("http-status-codes");
const { verifyQROffer } = require("../utils/jwt");
const offersUser = require("../models/offersUser.model");
const user = require("../models/user.model");
module.exports.add = async (req, res) => {
  try {
    let storePack = await packsStore.findOne({
      raw: true,
      attributes: [],
      include: {
        model: store,
        required: true,
        attributes: ["id"],
        where: { userId: req.user.id },
        raw: true,
      },
    });
    if (!storePack)
      throw Error(
        "لا يمكنك القيام بعملية النشر يجب ان تكون مشترك ببباقة للتمكن من عملية النشر "
      );
    let myStore = await store.findOne({
      attributes: ["id"],
      where: { userId: req.user.id },
    });
    if (myStore.requestDelete != null)
      throw Error("لا يمكنك القيام بعملية النشر فحسابك الان سيتم حذفه قريبا ");

    if (req.body.discount < 7) throw Error("يجب ان تكون اقل نسبة 7");

    if (
      await offer.findOne({
        where: { title: req.body.title.trim(), discount: req.body.discount },
      })
    )
      throw Error("العرض موجود من قبل");

    await offer.create({
      ...req.body,
      type: false,
      storeId: myStore.id,
    });

    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم انشاء العرض بنجاح" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
module.exports.update = async (req, res) => {
  try {
    let storePack = await packsStore.findOne({
      raw: true,
      attributes: [],
      include: {
        model: store,
        attributes: ["id"],
        required: true,
        where: { userId: req.user.id },
        raw: true,
      },
    });
    if (!storePack)
      throw Error(
        "لا يمكنك القيام بعملية التعديل يجب ان تكون مشترك بباقة للتمكن من عملية التعديل "
      );
    if (
      await store.findOne({
        attributes: ["id"],
        where: { userId: req.user.id, requestDelete: { [Op.not]: null } },
      })
    )
      throw Error("لا يمكنك القيام بعملية النشر فحسابك الان سيتم حذفه قريبا ");

    if (
      !(await offer.findOne({
        where: { id: req.params.id, storeId: storePack["store.id"] },
        attributes: ["id"],
        paranoid: false,
      }))
    )
      throw Error("رقم العرض لمدخل غير صحيح");

    if (req.body.discount < 7) throw Error("يجب ان تكون اقل نسبة 7");

    await offer.update(
      {
        ...req.body,
        type: false,
        storeId: storePack["store.id"],
      },
      { where: { id: req.params.id } }
    );

    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم تحديث العرض بنجاح" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
module.exports.delete = async (req, res) => {
  try {
    let offerDelete = await offer.findOne({
      attributes: [],
      paranoid: false,
      where: { id: req.params.id },
      include: {
        model: store,
        required: true,

        attributes: ["id"],
        where: { userId: req.user.id },
      },
    });

    if (!offerDelete) throw Error("رقم العرض لمدخل غير صحيح");

    await offer.destroy({ where: { id: req.params.id }, force: true });
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم حذف العرض بنجاح" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
module.exports.all = async (req, res) => {
  try {
    let data = await offer.findAll({
      raw: true,
      attributes: { exclude: ["storeId", "id"] },
      paranoid: false,
      include: {
        model: store,
        required: true,

        attributes: [],
        where: { userId: req.user.id },
      },
    });
    let result = { active: [], notActive: [] };
    data.forEach((record) => {
      if (record.disableAt) result.notActive.push(record);
      else result.active.push(record);
    });
    res.status(StatusCodes.OK).send({ success: true, data: result });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
module.exports.disable = async (req, res) => {
  try {
    let offerDisable = await offer.findOne({
      raw: true,
      attributes: [],
      where: { id: req.params.id },
      include: {
        model: store,
        required: true,

        attributes: ["id"],
        where: { userId: req.user.id },
      },
    });

    if (!offerDisable) throw Error("رقم العرض لمدخل غير صحيح");
    await offer.destroy({ where: { id: req.params.id } });
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم تعطيل العرض من الظهور بنجاح" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
module.exports.enable = async (req, res) => {
  try {
    let offerEnable = await offer.findOne({
      raw: true,
      attributes: [],
      paranoid: false,
      where: { id: req.params.id, disableAt: { [Op.not]: null } },
      include: {
        model: store,
        required: true,

        attributes: ["id"],
        where: { userId: req.user.id },
      },
    });

    if (!offerEnable) throw Error("رقم العرض لمدخل غير صحيح");
    await offer.update(
      { disableAt: null },
      { where: { id: req.params.id }, paranoid: false }
    );
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم تفعيل العرض بنجاح" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
// ! offer
module.exports.verifyOffer = async (req, res) => {
  try {
    let info = verifyQROffer(req.body.QR.trim());

    let myOffer = await offersUser.findOne({
      where: {
        offerId: info.offerId,
        userId: info.userId,
      },
    });
    if (!myOffer) throw Error("القيم المدخلة غير صحيحة");

    await myOffer.destroy();

    res.status(StatusCodes.OK).send({ success: true });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

module.exports.usersOfOffer = async (req, res) => {
  try {
    let myStore = await store.findOne({
      where: { userId: req.user.id },
      attributes: ["id"],
      raw: true,
    });
    let data = await offersUser.findAll({
      where: { offerId: req.params.id, dataTake: { [Op.not]: null } },
      paranoid: false,
      attributes: ["createdAt", "dataTake"],
      order: [["createdAt", "DESC"]],
      include: [
        {
          attributes: [],
          model: offer,
          required: true,
          where: { id: req.params.id, storeId: myStore.id },
        },
        {
          model: user,
          required: true,
          attributes: ["name", "username", "avatar", "gender"],
        },
      ],
    });
    res.status(StatusCodes.OK).send({ success: true, data });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
