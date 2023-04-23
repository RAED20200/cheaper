require("dotenv").config({
  path: `../.env`,
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
// const moment = require("moment");

class spams extends Model {}
spams.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    offerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING(300),
      notEmpty: true,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "لا يمكنك ترك حقل لسبب فارغ ",
        },
      },
      set(value) {
        this.setDataValue("reason", value.trim());
      },
    },
    createdAt: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
    sequelize, // We need to pass the connection instance
    modelName: "spams", // We need to choose the model name
    timestamp: true,
    updatedAt: false,
  }
);
module.exports = spams;
