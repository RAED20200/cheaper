require("dotenv").config({
  path: "../.env",
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
const moment = require("moment");
class users_Pivot_category extends Model {}

users_Pivot_category.init(
  {
    //permission id
    categoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    //  user id
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
    sequelize, // We need to pass the connection instance
    tableName: "users_Pivot_category",
    timestamps: false,
  }
);

module.exports = users_Pivot_category;
