const Users = require("../models/user.model");
require("../models/relations");
const fs = require("fs");
const { Op } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const { compare } = require("../utils/bcrypt");
//utils folder
const _ = require("lodash");
const rand = require("randomstring");
const NodeCache = require("node-cache");
const myCache = new NodeCache();
const { setInterests } = require("../controllers/users.controllers");
const { removeFolder, sortAvatars, removePic } = require("../utils/helper");
const sequelize = require("../utils/connect");
const Store = require("../models/store.model");
const { sendCheck, sendEmail } = require("../utils/nodemailer");
const moment = require("moment");
const useragent = require("useragent");
const store = require("../models/store.model");
const { setToken } = require("./auth.controllers");
const tokenTable = require("../models/tokenTable.model");
//*help function
//remove account manager
let removeManger = async (req, store, b) => {
  try {
    //to get the all record of user offer not taken yet
    let userPivotOffers = await sequelize.query(
      `select offer.id as Offer_Id from store,offer,offersuser	
       where  
        offer.storeId=store.id and offersuser.offerId=offer.id  and
        store.id=${store.id}
       limit 1 ;`,
      {
        type: sequelize.QueryTypes.SELECT,
      }
    );
    //if not found date and found   any record  offer for user then execute this
    if (!store.requestDelete && userPivotOffers.toString() != []) {
      // manger store first once to disable or delete  the store , then not allow him to disable or delete before ended the all user offers taken
      store.requestDelete = new Date();
      await store.save();
      throw Error(
        "لا يمكنك ان تقوم بهذه العملية حتى يتم انتهاء جميع المستخدمين من استلام العروض او انتهاء مدة العرض علما انه من هذه اللحظة  ستيم ايقاف ظهور عروضك عند المستخدمين  الاخرين"
      );
      //if found record offer for user not taken yet then execute this
    } else if (userPivotOffers.toString() != [])
      throw Error(
        "لا يمكنك القيام بهذه العملية حتى يتم انتهاء فترة العروض او تسليم العروض لزبائن"
      );
    //if found date and not found any offer for user then execute this
    else {
      //here the manger is click disable after is not has any record  (getOffers_pivot_users)
      //! here should hooks before delete then delete every thing about this store
      await req.user.destroy({ force: b });
      //! should write in the hooks if before delete is soft delete then not delete but set disable,otherwise remove it
    }
    return true;
  } catch (err) {
    return { err: err.message };
  }
};

//controller
//! image
//upload image
module.exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw Error("لا يوجد صورة ");

    let str = req.file.path;
    let serverIndex = str.indexOf("\\upload");
    if (serverIndex !== -1) req.file.path = str.substring(serverIndex);

    await Users.update(
      { avatar: req.file.path },
      { where: { id: req.user.id } }
    );
    //remove the image from the folder
    if (fs.existsSync(req.user.avatar)) removePic(req.user.avatar);
    res.status(StatusCodes.OK).send({ success: true });
  } catch (err) {
    if (fs.existsSync(req.file)) removePic(req.file.path);
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
// get image
module.exports.getImage = async (req, res) => {
  try {
    return res
      .status(StatusCodes.OK)
      .send({ success: true, data: req.user.avatar });
  } catch (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};
//delete image
module.exports.deleteImage = async (req, res) => {
  try {
    if (!req.user.avatar) throw Error("لا يوجد صورة ");
    await Users.update({ avatar: null }, { where: { id: req.user.id } });
    removePic(req.user.avatar);
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تمت عملية الحذف بنجاح" });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//! account
//remove account
module.exports.remove = async (req, res) => {
  try {
    //! here should use hooks before delete the user delete every thing about user and before delete the manger store delete should delete store and offer and other things about this store
    let store = await Store.findOne({
      where: { userId: req.user.id },
    });
    if (!store) {
      //if is normal user
      await req.user.destroy({ force: true });
      //this for remove the folder for this user

      removeFolder("users", req.user.id);
    } else {
      ///if manger store
      let { err } = await removeManger(req, store, true);
      if (err) throw Error(err);

      removeFolder("mangers", req.user.id);
    }
    res.status(StatusCodes.OK).send({ success: true });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};

//edit email
module.exports.editEmail = async (req, res) => {
  try {
    const validPassword = await compare(req.body.password, req.user.password);
    if (!validPassword) {
      let emailBody = `<h3>بعض الاجهوزة تحاول تغير الايميل الخاص بك هل هو انت ام شخص اخر ؟ الرجاء القيام بتغير كلمة المرور لحماية الحساب الخاص بك </h3>`;

      await sendCheck(req.user.email, emailBody);
      throw Error("كلمة المرور غير صحيحة ");
    }
    const code = rand.generate({
      length: 6,
      charset: "numeric",
    });

    let emailBody = `<h3>الكود المرسل الخاص بعملية التفعيل ${code}</h3>

    <h2>علما انه سينتهي صلاحية الرمز المدخلة بعد مرور 10 دقائق من الان </h2>

    <h1>الوقت الان </h1><h1>${moment().format("YYYY-MM-DD h:mm:ss")}</h1>
    `;

    let result = await sendCheck(req.body.newEmail, emailBody);
    if (result.error) throw Error(result.error);
    //set the value in cache with user ID
    myCache.set(
      req.user.id,
      JSON.stringify({
        newEmail: req.body.newEmail,
        code,
      })
    );
    //use to remove the code from the cache after 10 minute
    setTimeout(() => {
      let result = myCache.get(req.user.id);
      if (result) myCache.del(req.user.id);
    }, 3 * 60 * 1000);

    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم ارسال الرمز الى الايميل المدخل " });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
//verify email
module.exports.verifyEmail = async (req, res) => {
  try {
    let result = myCache.get(req.user.id);

    if (!result)
      throw Error(
        "انتهى صلاحية الرمز المدخل الرجاء القيام باعادة الارسال والتحقق من جديد "
      );
    result = JSON.parse(result);

    if (result.newEmail != req.body.newEmail)
      throw Error("الايميل المدخلة غير صحيح");

    if (result.code != req.body.code) throw Error("الرقم المدخل غير مطابق");

    req.user.email = req.body.newEmail;
    await req.user.save();
    myCache.del(req.user.id);
    res.status(StatusCodes.OK).send({ success: true, msg: "تم التحديث بنجاح" });
  } catch (error) {
    res
      .status(StatusCodes.BAD_GATEWAY)
      .send({ success: false, error: error.message });
  }
};
//change password
module.exports.changePassword = async (req, res) => {
  try {
    if (req.body.password == req.body.newPassword)
      throw Error("الرجاء ادخال كلمة مرور مختلفة عن الكلمة السابقة ");

    //compare password
    const validPassword = await compare(req.body.password, req.user.password);
    // console.log(req.body.password, req.user.password);
    // let agent = useragent.parse(req.headers["user-agent"]);
    /// console.log(validPassword);
    if (!validPassword) {
      // let emailBody = `
      // <h3>بعض الاجهوزة تحاول تغير كلمة المرور الخاص بك هل هو انت ام شخص اخر ؟ الرجاء القيام بتغير كلمة المرور لحماية الحساب الخاص بك </h3>
      // <h3>تفاصيل الجهاز </h3>
      // <h2>browser : ${agent.family}</h2><br>
      // <h2>system : ${agent.os.toString()}</h2><br>
      // <h2>device : ${agent.device.toString()}</h2><br>
      // <h2>ip : ${req.ip.toString()}</h2><br>
      // `;
      // await sendCheck(req.user.email, emailBody);
      throw Error("كلمة المرور غير صحيحة ");
    }

    req.user.password = req.body.newPassword;
    await req.user.save();
    res.status(StatusCodes.OK).send({ success: true });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//change phone number
module.exports.changePhone = async (req, res) => {
  try {
    if (req.user.phoneNumber.trim() == req.body.phoneNumber.trim())
      throw Error("الرجاء ادخال رقم هاتف مختلف");

    let user = await Users.findOne({
      attributes: ["id"],
      where: {
        phoneNumber: req.body.phoneNumber.trim(),
        id: { [Op.not]: req.user.id },
      },
    });

    if (user) throw Error("رقم الهاتف موجود لحساب اخر");

    req.user.phoneNumber = req.body.phoneNumber;
    await req.user.save();
    res.status(StatusCodes.OK).send({ success: true });
  } catch (err) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: err.message });
  }
};

//profile account
module.exports.getProfile = async (req, res, next) => {
  try {
    // console.log(await req.user.getStores({ raw: true, limit: 1 }));
    //!should get interests as array and pass it for frontend

    let myStore = await store.findOne({
      where: { userId: req.user.id },
      raw: true,
      attributes: ["id"],
    });

    let user = null;
    if (!myStore) {
      //normal user
      let allCategory = await req.user.getCategories({
        raw: true,
        attributes: ["name"],
      });
      user = _.omit(req.user.toJSON(), [
        "disableAt",
        "id",
        "roleId",
        "createdAt",
        "moreInfo",
        "password",
        "role",
      ]);
      user.category = allCategory.map((e) => _.pick(e, "name"));
    } else {
      //manger store
      user = _.omit(req.user.toJSON(), [
        "disableAt",
        "id",
        "roleId",
        "createdAt",
        "moreInfo",
        "password",
        "role",
      ]);
    }
    res.status(StatusCodes.OK).json({ success: true, data: user });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ success: false, error: error.message });
  }
};
//update account
module.exports.update = async (req, res) => {
  try {
    if (!req.file) throw Error("لا يوجد صورة ");
    //check value
    let user = await Users.findOne({
      attributes: ["id"],
      where: {
        id: { [Op.ne]: req.user.id },
        username: req.body.username.trim(),
      },
      paranoid: false,
    });
    if (user) throw Error("اسم المستخدم  موجود مسبقاً");

    let myStore = await store.findOne({
      attributes: ["id"],
      where: { userId: req.user.id },
    });
    let userInfo = null;
    if (myStore) {
      //manger account
      //sort the avatar
      let pathBefore = req.user.avatar;
      let resultSort = sortAvatars(req, "mangers", req.user.id);
      if (resultSort.error) throw Error(resultSort.error);

      let eer = removePic(pathBefore);
      if (eer) throw Error(eer);
      userInfo = { ..._.omit(req.body, "birthday") };
    } else {
      //user account
      if (!req.body.category) throw Error("لا يمكنك ترك الاهتمامات فارغة");
      //update interests
      let { error } = await setInterests(req, req.user);
      if (error) throw Error(error);

      let pathBefore = req.user.avatar;
      let resultSort = sortAvatars(req, "users", req.user.id);
      if (resultSort.error) throw Error(resultSort.error);

      let eer = removePic(pathBefore);
      if (eer) throw Error(eer);

      userInfo = { ...req.body };
    }
    if (req.body.username.trim() != req.user.username.trim()) {
      await tokenTable.destroy({
        where: { token: req.cookies["cheaper-token"] },
      });
      await setToken(req, res, req.user.id);
    }
    await Users.update(
      { ...userInfo, avatar: req.file.path },
      { where: { id: req.user.id } }
    );
    res.status(StatusCodes.OK).send({ success: true });
  } catch (error) {
    if (req.file) removePic(req.file.path);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};
