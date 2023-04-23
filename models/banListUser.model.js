require("dotenv").config({
  path: `../.env`,
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
const moment = require("moment");

class banListUser extends Model {}
banListUser.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    banListId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    block_date: {
      type: DataTypes.DATE,
      allowNull: false,
      isDate: true,
    },
  },
  {
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
    sequelize, // We need to pass the connection instance
    modelName: "banListUser", // We need to choose the model name
    timestamp: true,
    updatedAt: false,
    paranoid: true,
    createdAt: "block_date",
    deletedAt: "unblock_date",
  }
);
module.exports = banListUser;
