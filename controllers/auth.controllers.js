const Users = require("../models/user.model");
//utils folder
const { createToken } = require("../utils/jwt");
const { StatusCodes } = require("http-status-codes");
const { compare } = require("../utils/bcrypt");
const { createStore } = require("./stores.controllers");
const { setInterests } = require("./users.controllers");
const { Op } = require("sequelize");
require("../models/relations");
let { checkAvatars, removeAvatars, removePic } = require("../utils/helper");
const tokenTable = require("../models/tokenTable.model");
const users = require("../models/user.model");
const role = require("../models/role.model");
const useragent = require("useragent");

const moment = require("moment");
const { indexOf } = require("lodash");
const packsStore = require("../models/packsStore.model");
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

let setToken = async (req, res, id) => {
  let agent = useragent.parse(req.headers["user-agent"]);
  const token = createToken(req, {
    username: req.body.username.trim(),
  });
  await tokenTable.create({
    token,
    browser: agent.family,
    system: agent.os.toString(),
    device: agent.device.toString(),
    userId: id,
    expiresAt: moment().add(90, "days").format("YYYY-MM-DD h:mm:ss"),
  });

  // res.cookie("cheaper-token", token, {
  //   //90 day
  //   //day * hour * minute * second * mile second
  //   maxAge: 90 * 24 * 60 * 60 * 1000,
  //   httpOnly: true,
  // });
  // res.cookie("cheaper-checkToken", true, {
  //   //day * hour * minute * second * mile second
  //   maxAge: 90 * 24 * 60 * 60 * 1000,
  // });
  return token;
};
module.exports.setToken = setToken;
//* Sign Up for user
module.exports.signUpUser = async (req, res) => {
  try {
    let user = await Users.findOne({
      attributes: ["id"],
      where: {
        [Op.or]: [
          { username: req.body.username.trim() },
          { phoneNumber: req.body.phoneNumber.trim() },
        ],
      },
    });
    if (user) throw Error("بعض الحول المدخلة غير صحيحة");

    //create user
    var newUser = await Users.create({
      //because role id for user is 2
      roleId: 2,
      ...req.body,
      user_settings: process.env.USER_SETTINGS,
    });

    ///create interests
    let { error } = await setInterests(req, newUser);
    if (error) {
      //delete this user from database
      await newUser.destroy({ force: true });
      throw Error(error);
    }
    let token = await setToken(req, res, newUser.id);

    let myRole = await role.findByPk(2);
    //done created
    res.status(StatusCodes.CREATED).send({
      success: true,
      data: {
        token,
        name: myRole.name,
        permission: JSON.parse(myRole.data),
      },
    });
  } catch (error) {
    //return error to user
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};

//* Sign Up for Manger Store
module.exports.signUpManger = async (req, res) => {
  try {
    if (!req.files || req.files.length != 2)
      throw Error("بعض حقول الصور غير صحيحة ");

    let user = await Users.findOne({
      attributes: ["id"],
      where: {
        [Op.or]: [
          { username: req.body.username.trim() },
          { phoneNumber: req.body.phoneNumber.trim() },
        ],
      },
    });
    if (user) {
      throw Error("اسم المستخدم او  ارقام الهاتف موجودة لحساب اخر ");
    }
    //?create manger (User) account
    var manger = await Users.create({
      //because role id for new manger is 3 ,after accepted from the admin  then change role (for allow to manger to modify offer )
      roleId: 3,
      ...req.body,
      user_settings: process.env.USER_SETTINGS,
    });

    //? create store
    let result = await createStore(req, manger);

    if (result.error) {
      //for remove every avatars uploaded because error happen
      //delete this user from database
      await manger.destroy({ force: true });
      throw Error(result.error);
    }
    for (let i = 0; i < req.files.length; i++) {
      str = req.files[i].path;
      serverIndex = str.indexOf("\\upload");
      if (serverIndex !== -1) req.files[i].path = str.substring(serverIndex);
    }
    let moreInfo = JSON.stringify({
      avatarIdentity1: req.files[0].path,
      avatarIdentity2: req.files[1].path,
    });
    await Users.update({ moreInfo }, { where: { id: manger.id } });

    let token = await setToken(req, res, manger.id);

    let myRole = await role.findByPk(3);

    await packsStore.create({ storeId: result.myStore.id, packId: 1 });

    //done created
    res.status(StatusCodes.CREATED).send({
      success: true,

      data: { token, name: myRole.name, permission: JSON.parse(myRole.data) },
    });
  } catch (error) {
    removePic(req.files[0].path);
    removePic(req.files[1].path);
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};

//* login
module.exports.login = async (req, res) => {
  try {
    const myInfo = await users.findOne({
      where: { username: req.body.username.trim() },
      attributes: ["disableAt", "id", "password"],
      include: { model: role, required: true, attributes: ["name", "data"] },
      paranoid: false,
    });

    //if not found user like this username
    if (!myInfo) throw Error("اسم المستخدم غير صحيح");

    //compare password
    const validPassword = await compare(req.body.password, myInfo.password);
    if (!validPassword) throw Error("كلمة المرور غير صحيحة ");

    //if user account is disable before then reactive this account
    if (myInfo.disableAt) await myInfo.restore();

    let token = await setToken(req, res, myInfo.id);

    res.status(StatusCodes.OK).send({
      success: true,
      data: {
        token,
        name: myInfo.role.name,
        permission: JSON.parse(myInfo.role.data),
      },
    });
  } catch (error) {
    //throw error to user
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};

//* logout
module.exports.logout = async (req, res) => {
  try {
    // console.log(req.headers);
    //delete token access
    let agent = useragent.parse(req.headers["user-agent"]);

    let token = await tokenTable.findOne({
      attributes: ["id"],
      where: {
        token: req.cookies["cheaper-token"],
        browser: agent.family,
        device: agent.device.toString(),
        userId: req.user.id,
      },
    });

    if (!token) throw Error("هذا الحساب مسجل خروج من هذا المتصفح ");

    token.destroy({ force: true });

    res.clearCookie("cheaper-token");
    res.cookie("cheaper-checkToken", false, {});
    res
      .status(StatusCodes.OK)
      .send({ success: true, msg: "تم تسجيل الخروج بنجاح " });
  } catch (error) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send({ success: false, error: error.message });
  }
};
