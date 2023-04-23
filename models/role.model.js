require("dotenv").config({
  path: "../.env",
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
const moment = require("moment");
class role extends Model {}

role.init(
  {
    name: {
      type: DataTypes.STRING(150),
      notEmpty: true,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 150], //mean min length  4 and max  length 10

        notEmpty: {
          msg: "لا يمكنك ترك حقل الاسم فارغ ",
        },
      },
      set(value) {
        this.setDataValue("name", value.trim());
      },
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    sequelize,
    timestamps: false,
    tableName: "role",
  }
);

module.exports = role;
