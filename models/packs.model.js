require("dotenv").config({
  path: "../.env",
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
const moment = require("moment");
class pack extends Model {}

pack.init(
  {
    name: {
      type: DataTypes.STRING(150),
      notEmpty: true,
      unique: true,
      allowNull: false,
      validate: {
        len: [1, 150], //mean min length  4 and max  length 10

        notEmpty: {
          msg: "name payment  can't be empty here ",
        },
      },
      set(value) {
        this.setDataValue("name", value.trim());
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      notEmpty: {
        msg: "duration can't be empty",
      },
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      notEmpty: {
        msg: "price can't be empty",
      },
    },
  },
  {
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
    sequelize, // We need to pass the connection instance
    tableName: "pack",
    timestamps: false,

    //! Trigger
    //delete every store have this category
    //delete every userCategoryPivot have this category
  }
);

module.exports = pack;
