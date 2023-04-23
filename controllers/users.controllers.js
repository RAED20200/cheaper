const offersUser = require("../models/offersUser.model");
const users_Pivot_category = require("../models/users_Pivot_category");

require("../models/relations");

const { Op } = require("sequelize");
const Category = require("../models/category.model");
const { StatusCodes } = require("http-status-codes");
const { createQROffer } = require("../utils/jwt");
const _ = require("lodash");
const store = require("../models/store.model");
const spams = require("../models/spams.model");
const moment = require("moment");
const user = require("../models/user.model");
const offer = require("../models/offer.model");
const geolib = require("geolib");
const sequelize = require("../utils/connect");
const storeStory = require("../models/storeStory.model");

//! interests User
let setInterests = async (req, user) => {
  //user now sign in
  try {
    let allCategory = await Category.findAll({
      attributes: ["name", "id"],
      raw: true,
    });
    //we using "set" for unique value
    let category = new Set(req.body.category.map((e) => e.trim()));
    //should every name category is in database
    let ans = [...category].every((e) =>
      allCategory.some((element) => e == element.name)
    );

    if (!ans)
      return {
        error:
          "بعض القيم المدخل غير مطابقة للقيم الموجودة ضمن الاصناف الرجاء اعادة ادخال بشكل الصحيح",
      };

    ans = [...category].map((e) =>
      allCategory.some((element) => e == element.name)
    );

    //user to get id for every category
    let array = [...category].map((e) => {
      let idCategory = 0;
      allCategory.forEach((element) => {
        if (element.name == e) {
          idCategory = element.id;

          return;
        }
      });
      return { userId: user.id, categoryId: idCategory };
    });
    await users_Pivot_category.destroy({ where: { userId: user.id } });

    await users_Pivot_category.bulkCreate([...array]);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
module.exports.setInterests = setInterests;

//add spam
module.exports.addSpam = async (req, res) => {
  try {
    let myInfo = await offersUser.findOne({
      where: {
        userId: req.user.id,
        offerId: req.params.id,
      },
      paranoid: false,
      include: { model: offer, required: true, attributes: ["id"] },
      attributes: ["id", "createdAt"],
      raw: true,
    });
    ///user is not have like this offer
    if (!myInfo) throw Error("رقم العرض المدخل غير صحيح ");

    //should after 3 days can't do spam for this offer
    let momentDateToday = moment();
    let momentCreatedAt = moment(myInfo.createdAt);
    if (momentDateToday.diff(momentCreatedAt, "days") > 3)
      throw Error(
        "لا يمكنك القيام بعملية الابلاغ علما ان صلاحية عملية البلاغ قد انتهت "
      );
    await spams.create({
      ...req.body,
      offerId: myInfo["offer.id"],
      userId: req.user.id,
    });
    res
      .status(StatusCodes.OK)
      .send({ success: false, msg: "تم الابلاغ بنجاح" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}
module.exports.chooseOffer = async (req, res) => {
  try {
    let dataToday = moment();
    let offerFound = await offersUser.findOne({
      where: { userId: req.user.id },
      attributes: ["id", "createdAt"],
      raw: true,
      paranoid: false,
    });

    if (offerFound && dataToday.diff(offerFound.createdAt, "days") < 1)
      throw Error("لا يمكنك اختيار اكثر من عرض بنفس اليوم ");
    /*----------------------------------------- */
    ///? choose random category
    let allCategory = await req.user.getCategories({
      raw: true,
      attributes: ["id", "name"],
    });
    let randomCategoryId =
      Math.floor(Math.random() * allCategory.length - 1) + 1;
    let myCategory = shuffleArray(allCategory)[randomCategoryId];
    // console.log(myCategory);
    /*----------------------------------------- */
    // for get the store id nearest user with random category
    let resultQuery = await sequelize.query(
      ` SELECT calculate_nearest_store_distance(${req.body.latitude},${req.body.longitude},${myCategory.name}) AS storeId`,
      {
        type: sequelize.QueryTypes.RAW,
        raw: true,
      }
    );
    let storeId = resultQuery[0][0].storeId;
    let storeInfo = await store.findOne({
      where: { id: storeId },
      attributes: {
        exclude: ["unavailableAt", "categoryId", "userId", "requestDelete"],
      },
    });
    let storeOfStory = await storeStory.findAll({
      where: { storeId },
      attributes: ["avatar"],
    });
    // /*----------------------------------------- */
    // //? choose random offer in store
    let offers = await offer.findAll({
      where: { storeId: storeId },
      raw: true,
      attributes: ["id", "title", "description", "discount"],
    });
    let randomOfferId = Math.floor(Math.random() * offers.length - 1) + 1;
    let myOffer = shuffleArray(offers)[randomOfferId];
    // /*----------------------------------------- */
    // //?create token For QR Code
    let QR = createQROffer({ offerId: myOffer.id, userId: req.user.id });
    let offerCreated = await offersUser.create({
      offerId: myOffer.id,
      userId: req.user.id,
      QR,
    });
    res.status(StatusCodes.OK).send({
      success: true,
      data: {
        offer: myOffer,
        store: { storeInfo, storeOfStory },
        duration: moment(offerCreated.createdAt)
          .add(2, "days")
          .format("YYYY-MM-DD hh:mm"),
        category: myCategory.name,
        QR,
      },
    });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};

module.exports.gift = async (req, res) => {
  try {
    let offer = await offersUser.findOne({
      where: { userId: req.user.id, offerId: req.params.id },
    });

    if (!offer) throw Error("لا تمتلك هذا العرض ل اهدائه");

    let giftedUser = await user.findOne({
      attributes: ["id"],
      raw: true,
      where: { username: req.body.username.trim(), roleId: 2 },
    });
    if (!giftedUser) throw Error("اسم المستخدم غير صحيح");

    await offersUser.update(
      { userId: giftedUser.id },
      { where: { userId: req.user.id, offerId: req.params.id } }
    );
    res
      .status(StatusCodes.OK)
      .send({ success: false, msg: "تمت عملية الاهداء بنجاح" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};

module.exports.allMyOffer = async (req, res) => {
  try {
    let result = { now: [], recent: [] };
    let data = await offersUser.findAll({
      attributes: ["createdAt", "dataTake", "QR", "id"],
      paranoid: false,
      where: {
        userId: req.user.id,
      },
      include: {
        model: offer,
        required: true,

        attributes: ["discount", "description", "title", "id"],
      },
    });
    data.forEach((myOffer) => {
      let momentDateToday = moment();
      let momentCreatedAt = moment(data.createdAt);

      (momentDateToday.diff(momentCreatedAt, "days") > 2 &&
        !myOffer.dataTake) ||
      myOffer.dataTake
        ? result.recent.push(myOffer)
        : result.now.push(myOffer);
    });
    res.status(StatusCodes.OK).send({ success: true, data: result });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
