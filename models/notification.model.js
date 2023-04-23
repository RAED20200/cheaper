require("dotenv").config({
  path: "../.env",
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
const moment = require("moment");

class notification extends Model {}

notification.init(
  {
    message: {
      type: DataTypes.STRING,
      notEmpty: true,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "message    can't be empty here ",
        },
      },
      set(value) {
        this.setDataValue("message", value.trim());
      },
    },
  },
  {
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
    sequelize, // We need to pass the connection instance
    tableName: "notification",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = notification;
