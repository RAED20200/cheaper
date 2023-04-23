require("dotenv").config({
  path: `../.env`,
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
const { bcrypt } = require("../utils/bcrypt");
const moment = require("moment");

//relationship model
class user extends Model {
  //instance method
}

user.init(
  {
    name: {
      type: DataTypes.STRING(50),

      notEmpty: true,
      allowNull: false,

      len: [2, 50], //mean min length  4 and max  length 10
      validate: {
        notEmpty: {
          msg: "لا يمكنك ترك الاسم فارغ ",
        },
        notContains: [
          "Fuck",
          "Piss off",
          "Bugger off",
          "Bloody hell",
          "Bastard",
          "Bollocks",
          "Motherfucker",
          "Wanker",
          "tosser",
          "كلب",
          "حقير",
          "تافه",
        ],
      },
      set(value) {
        this.setDataValue("name", value.trim());
      },
    },
    gender: {
      //0 male , 1 female
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "لايمكن ترك الجنس فارغ الرجاء ادخال الجنس ومن ثم اعادى المحاولة ",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: {
        args: true,
        msg: "رقم الهاتف1 موجود ل حساب اخر ",
      },
      is: /^(09)(\d{8})$/,
      validate: {
        notEmpty: {
          msg: "لا يمكن ترك رقم الهاتف فارغ",
        },
        // is: {
        //   msg: "رقم الهاتف غير صحيح الرجاء اعادة ادخال رقم الهاتف بلشكل الصحيح ",
        // },
      },
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: "تاريخ الميلاد غير صحيح",
        },
      },
      get() {
        if (this.getDataValue("birthday"))
          return moment.utc(this.getDataValue("birthday")).format("YYYY-MM-DD");
      },
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      is: /^[A-Za-z]+[a-zA-Z0-9\_\.]*$/,

      unique: {
        args: true,
        msg: "اسم المستخدم موجود لحساب اخر ",
      },
      validate: {
        notEmpty: {
          msg: "لايمكنك ترك اسم المستخدم فارغ ",
        },
        len: {
          args: [3, 30],
          msg: "لا يمكن ن يكون اسم المستخدم اقل من 3 محارف او اكثر من 30 محرف ",
        },
      },
      set(value) {
        this.setDataValue("username", value.trim().toLowerCase());
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "لايمكن ان يكون كلمة السر فارغة ",
        },
      },
    },

    avatar: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
    user_settings: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      isDate: true,
      validate: {
        notEmpty: {
          msg: "لايمكنك ترك تاريخ الانشاء فارغ ",
        },
        isDate: {
          msg: "الرجاء ادخال التاريخ بلشكل الصحيح ",
        },
      },
      get() {
        return moment.utc(this.getDataValue("createdAt")).format("YYYY-MM-DD");
      },
    },
    moreInfo: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    //If account is disable
    disableAt: {
      type: DataTypes.DATE,
      allowNull: true,
      isDate: true,
      validate: {
        isDate: {
          msg: "الرجاء ادخال التاريخ بلشكل الصحيح ",
        },
      },
      get() {
        if (this.getDataValue("disableAt"))
          return moment
            .utc(this.getDataValue("disableAt"))
            .format("YYYY-MM-DD");
      },
    },
  },

  {
    sequelize, // We need to pass the connection instance
    tableName: "user",
    timestamps: true,
    paranoid: true, //to set the delateAt and mean disable account
    deletedAt: "disableAt",
    updatedAt: false,
    //! Triggers
    hooks: {
      beforeCreate: (user) => {
        //check if password is content the username
        if (user.password.includes(user.username))
          throw new Error(
            `\n Can't password is content  username :( \n  Your password : ${user.password} \n  Your username : ${user.username}`
          );

        //check if the username  is same tha password
        if (user.userName === user.password)
          throw new Error("Can't be username is same password ");

        //bcrypt password
        user.password = bcrypt(user.password);
        // console.log(await bcrypt(user.password));
      },
      beforeUpdate: (user) => {
        if (user.password) {
          //use to check if their are password
          //bcrypt password
          user.password = bcrypt(user.password);
        }
      },

      // beforeSave: async (user) => {
      //   if (user.password) {
      //     //use to check if their are password
      //     //bcrypt password
      //     user.password = await bcrypt(user.password);
      //   }
      // },
    },
  }
);

//! Hooks "Triggers"
// //before delete any user then delete account user
// Users.beforeBulkDestroy(async (user) => {
//   await Accounts.destroy({ where: { userId: user.where.id }, force: true });
// });
module.exports = user;
