const Stores = require("../models/store.model");
const Packs = require("../models/packs.model");
const packsStore = require("../models/packsStore.model");
const StoreStory = require("../models/storeStory.model");
require("../models/relations");
const { Op, Sequelize } = require("sequelize");
let path = require("path");
const _ = require("lodash");
const { StatusCodes } = require("http-status-codes");
let {
  removeFolder,
  sortAvatars,
  removePic,
  moveFile,
} = require("../utils/helper");
const User = require("../models/user.model");
const stores = require("../models/store.model");
const pack = require("../models/packs.model");
const Category = require("../models/category.model");
//this for create avatars store
let createStoreStory = async (req, store) => {
  //! should upload every image "StoreStory"
  try {
    let storeStory = [];
    for (let i = 0; i < req.files.StoreStory.length; i++)
      storeStory.push({
        storeId: store.id,
        avatar: req.files.StoreStory[i].path,
      });
    // console.log(storeStory);
    //create all avatar store
    await StoreStory.bulkCreate([...storeStory]);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

//controllers
//share with other file in project
module.exports.createStoreStory = createStoreStory;
//create Store
module.exports.createStore = async (req, manger) => {
  try {
    //validate the manger

    let myStore = await Stores.findOne({
      attributes: ["id"],
      where: {
        nameStore: req.body.nameStore.trim(),
      },
      paranoid: false,
    });
    if (myStore)
      throw Error(`اسم المحل \'${req.body.nameStore.trim()}\' موجود بلفعل `);

    let myCategory = await Category.findOne({
      attributes: ["id"],
      where: { name: req.body.category.trim() },
      raw: true,
    });
    if (!myCategory) throw Error("صنف المتجر غير صحيح ");

    //should re store the image at the right path
    let resultSort = sortAvatars(req, "signup", manger.id);
    if (resultSort.error) throw Error(resultSort.error);

    //?create new store
    myStore = await Stores.create({
      ...req.body,
      categoryId: myCategory.id,
      userId: manger.id,
    });

    return { success: true, myStore };
  } catch (err) {
    removeFolder("mangers", manger.id);
    return { success: false, error: err.message };
  }
};
//update store
module.exports.update = async (req, res) => {
  try {
    if (!req.file) throw Error("لا يوجد صورة ");

    //validate name
    let store = await Stores.findOne({
      attributes: ["id"],
      where: {
        nameStore: req.body.nameStore.trim(),
        userId: { [Op.ne]: req.user.id },
      },
      paranoid: false,
    });
    if (store)
      throw Error(`اسم المتجر \'${req.body.nameStore.trim()}\' موجود بلفعل `);

    //?check category id
    let category = await Category.findOne({
      attributes: ["id"],
      where: { name: req.body.category.trim() },
    });
    if (!category) throw Error("اسم الصنف  غير صحيح");

    store = await Stores.findOne({
      attributes: ["avatar"],
      where: { userId: req.user.id },
    });
    // store = req.user.toJSON().stores[0];
    //path in temp
    let pathBefore = store.avatar;
    // console.log(pathBefore, "before");
    //remove the avatar from the temp folder
    removePic(pathBefore);

    // console.log(req.file.path, "now");
    //update stores in db
    await Stores.update(
      {
        ...req.body,
        avatar: req.file.path,
        categoryId: category.id,
        userId: req.user.id,
      },
      { where: { userId: req.user.id } }
    );
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: `تم التحديث بنجاح ` });
  } catch (err) {
    if (req.file) removePic(req.file.path);
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
module.exports.getAllInfo = async (req, res) => {
  try {
    let store = await Stores.findOne({
      where: { userId: req.user.id },
      attributes: [
        "id",
        "nameStore",
        ["avatar", "picture"],
        "fromHour",
        "toHour",
        "longitude",
        "latitude",
      ],
      include: [
        {
          model: Category,
          required: true,

          attributes: [["name", "nameCategory"]],
        },
        {
          model: User,
          required: true,

          attributes: ["email", "phoneNumber", "email"],
        },
      ],
    });
    let AllStory = await StoreStory.findAll({
      where: { storeId: store.id },
      attributes: [["avatar", "picture"]],
    });

    //here should ask front end if need to show this pack or not
    //packs
    let packs = await packsStore.findAll({
      where: { storeId: store.id },
      attributes: ["createdAt"],
      include: { model: pack, required: true, attributes: { exclude: ["id"] } },
    });
    // console.log(packs);

    // packs = _.pick(packs[0], ["name", "duration", "price", "createdAt"]);
    let resultStore = _.omit(store.toJSON(), ["id"]);
    resultStore.packs = packs;
    resultStore.storyStore = AllStory;

    res.status(StatusCodes.OK).send({ success: true, data: resultStore });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//! packs

module.exports.disablePack = async (req, res) => {
  try {
    let store = await req.user.getStores({ raw: true, attributes: ["id"] });
    if (store.toString() == []) throw Error("يجب ان تمتلك متجر اولا ");

    const pack = await Packs.findByPk(req.params.id, { attributes: ["id"] });
    if (!pack) throw Error("رقم الباقة غير صحيح ");

    let packDel = await packsStore.findOne({
      where: { packId: req.params.id },
      attributes: ["id"],
    });
    if (!packDel)
      throw Error("الباقة المطلوبة محذوفة مسبقا او انك لم تشترك فيها ");

    await packDel.destroy();
    res.status(StatusCodes.OK).send({ success: true, msg: "تم الحذف بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//get all packs of this store and other store with have this user
module.exports.getPacks = async (req, res) => {
  try {
    let result = { active: {}, ended: [] };
    let all = await packsStore.findAll({
      attributes: ["createdAt", "deletedAt", "id"],
      paranoid: false,
      raw: true,
      include: [
        {
          model: pack,
          required: true,

          attributes: ["name", "duration", "price"],
          required: true,
        },
        {
          model: Stores,
          where: { userId: req.user.id },
          attributes: [],
          required: true,
        },
      ],
    });

    all.forEach((record) => {
      if (record.deletedAt) result.ended.push(record);
      else result.active = record;
    });
    res.status(StatusCodes.OK).send({ success: true, data: result });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//choose one of the pack for store
module.exports.choosePack = async (req, res) => {
  try {
    let store = await stores.findOne({
      attributes: ["id", "unavailableAt"],
      where: { userId: req.user.id },
    });
    if (!store) throw Error("لا يمكنك عرض الباقات دون ان تكون تمتلك متجر ");

    if (store.unavailableAt)
      throw Error("المحل غير مفعل الرجاء القيام بعملية التفعيل اولا");

    let myPack = await pack.findByPk(req.params.id, { attributes: ["id"] });
    if (!myPack) throw Error("رقم الباقة المدخل غير صحيح ");

    if (
      await packsStore.findOne({
        attributes: ["id"],
        where: { storeId: store.id },
      })
    )
      throw Error(
        "انت مشترك في باقة من قبل لايمكنك ان تشترك في اكثررمن باقة في نفس الوقت الرجاء الانتظار ل انتهار مدة الباقة او الغائها ثم قم  ب اعادة الاشتراك في باقة جديدة "
      );
    // console.log(req.params.id);
    await packsStore.create({
      storeId: store.id,
      packId: req.params.id,
    });
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم الاشتراك في الباقة بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: err.message });
  }
};

//! image avatar store
//upload image
module.exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw Error("لا يوجد صورة ");
    let store = await Stores.findOne({
      where: { userId: req.user.id },
      attributes: ["id"],
    });
    let str = req.file.path;
    let serverIndex = str.indexOf("\\upload");
    if (serverIndex !== -1) req.file.path = str.substring(serverIndex);

    await Stores.update({ avatar: req.file.path }, { where: { id: store.id } });
    removePic(store.avatar);

    res.status(StatusCodes.OK).send({ success: true });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
// get image
module.exports.getImage = async (req, res) => {
  try {
    let store = await Stores.findOne({
      where: { userId: req.user.id },
      attributes: ["avatar"],
    });
    if (!store.avatar) throw Error("لا يوجد صورة ");
    res.status(StatusCodes.OK).send({ success: true, data: store.avatar });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//delete image
module.exports.deleteImage = async (req, res) => {
  try {
    let store = await Stores.findOne({
      where: { userId: req.user.id },
      attributes: ["avatar", "id"],
    });
    // console.log(store);
    if (!store.avatar) throw Error("لا يوجد صورة ");
    await Stores.update({ avatar: null }, { where: { id: store.id } });
    removePic(store.avatar);

    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//! story store
//upload story mean add new story
module.exports.uploadStory = async (req, res, next) => {
  try {
    if (!req.file) throw Error("لا يوجد صورة ");

    let myStore = await stores.findOne({
      where: { userId: req.user.id },
      attributes: ["id"],
    });

    let allStory = await StoreStory.findAll({
      raw: true,
      where: { storeId: myStore.id },
      attributes: ["id"],
    });
    if (allStory.length == 4)
      throw Error("لا يمكن ان يكون لديك اكثر من 4 صور ");
    else {
      let myPath = moveFile(
        req.file.path,
        path.join(__dirname, `../upload/images/mangers/${req.user.id}`)
      );
      req.file.path = myPath;

      let str = req.file.path;
      let serverIndex = str.indexOf("\\upload");
      if (serverIndex !== -1) req.file.path = str.substring(serverIndex);

      await StoreStory.create({
        avatar: req.file.path,
        storeId: myStore.id,
      });
      res
        .status(StatusCodes.OK)
        .send({ success: true, msg: "تمت عملية الرفع بنجاح" });
    }
  } catch (err) {
    if (req.file) removePic(req.file.path);
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
// get All image
module.exports.getAllStory = async (req, res) => {
  try {
    let data = await StoreStory.findAll({
      attributes: ["avatar", "id"],
      include: {
        model: stores,
        attributes: [],
        required: true,

        where: { userId: req.user.id },
      },
    });

    res.status(StatusCodes.OK).send({ success: true, data });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//delete image
module.exports.deleteStory = async (req, res) => {
  try {
    let deleteStory = await StoreStory.findOne({
      attributes: ["avatar"],
      include: {
        model: Stores,
        required: true,

        attributes: ["id"],
        where: { userId: req.user.id, id: Sequelize.col("StoreStory.storeId") },
      },
      where: { id: req.params.id },
    });

    if (!deleteStory) throw Error("رقم الصورة المطلوب غير صحيح");

    await StoreStory.destroy({ where: { id: req.params.id } });
    removePic(deleteStory.avatar);

    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//delete image
module.exports.deleteAllStory = async (req, res) => {
  try {
    let allStory = await StoreStory.findAll({
      raw: true,
      attributes: ["avatar"],
      include: {
        model: Stores,
        required: true,

        attributes: ["id"],
        where: { userId: req.user.id, id: Sequelize.col("StoreStory.storeId") },
      },
    });

    if (allStory.toString() == []) throw Error("لا يوجد صور لحذفها ");

    await StoreStory.destroy({ where: { storeId: allStory[0]["store.id"] } });

    allStory.forEach((e) => {
      removePic(e.avatar);
    });
    // console.log();
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//update Image Story mean update recent story
module.exports.updateStory = async (req, res, next) => {
  try {
    if (!req.file) throw Error("لا يوجد صور ");
    //get store
    let store = await stores.findOne({
      where: { userId: req.user.id },
      attributes: ["id"],
    });
    let image = await StoreStory.findOne({
      attributes: ["avatar"],
      where: { storeId: store.id, id: req.params.id },
    });
    if (!image) throw Error("رقم الصورة المطلوب غير صحيح");

    let str = req.file.path;
    let serverIndex = str.indexOf("\\upload");
    if (serverIndex !== -1) req.file.path = str.substring(serverIndex);

    await StoreStory.update(
      { avatar: req.file.path },
      { where: { storeId: store.id, id: req.params.id } }
    );
    let err = removePic(image.avatar);
    if (err) throw Error(err.message);
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية التحديث بنجاح" });
  } catch (err) {
    if (req.file) removePic(req.file.path);

    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

// get Special Story
module.exports.getSpecialStory = async (req, res) => {
  try {
    let story = await StoreStory.findOne({
      attributes: ["avatar", "id"],
      include: {
        model: Stores,
        required: true,

        attributes: [],
        where: { userId: req.user.id, id: Sequelize.col("StoreStory.storeId") },
      },
      where: { id: req.params.id },
    });

    if (!story) throw Error("الصورة المطلوبة غير مودجودة");

    res.status(StatusCodes.OK).send({ success: true, data: story });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
