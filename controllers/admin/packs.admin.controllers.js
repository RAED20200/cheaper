const Packs = require("../../models/packs.model");
require("../../models/relations");

const _ = require("lodash");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
//create
module.exports.create = async (req, res) => {
  try {
    let pack = await Packs.findOne({
      attributes: ["id"],
      where: {
        name: req.body.name.trim(),
      },
    });
    if (pack)
      throw Error(`اسم الباقة   \'${req.body.name.trim()}\' موجود من قبل `);
    //create Pack in db
    await Packs.create({ ...req.body });
    res
      .status(StatusCodes.CREATED)
      .send({ success: true, msg: `تم انشاء الباقة بنجاح ` });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//update
module.exports.update = async (req, res) => {
  try {
    let pack = await Packs.findByPk(req.params.id, { attributes: ["id"] });
    if (!pack) throw Error(`رقم الباقة غير صحيح `);
    pack = await Packs.findOne({
      attributes: ["id"],
      where: { name: req.body.name, id: { [Op.not]: req.params.id } },
    });

    if (pack) throw Error(`اسم الباقة موجود من قبل`);

    //create category in db
    await Packs.update({ ...req.body }, { where: { id: req.params.id } });
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: `تم تحديث الباقة بنجاح ` });
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
    if (req.params.id == 1)
      throw Error(
        "لا يمكنك اجراء عملية الحذف لان الباقة هي الباقة الافتراضية "
      );
    const pack = await Packs.findByPk(req.params.id, { attributes: ["id"] });
    if (!pack) throw Error("رقم الباقة غير صحيح ");

    await pack.destroy({ force: true });
    return res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح " });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//get all category
module.exports.getAllPacks = async (req, res) => {
  try {
    let allPack = await Packs.findAll({
      raw: true,
      attributes: ["name", "duration", "price", "id"],
    });
    res.status(StatusCodes.OK).send({ success: true, data: allPack });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
