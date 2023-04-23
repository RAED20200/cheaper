require("dotenv").config({
  path: `../.env`,
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
const moment = require("moment");

class packsStore extends Model {}

packsStore.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    packId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    //is mean deleted date, when store manger click delete pack or ended pack
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      isDate: true,
    },
  },

  {
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
    sequelize, // We need to pass the connection instance
    tableName: "packsStore",
    timestamps: true,
    updatedAt: false,
    paranoid: true, //to set the delateAt
  }
);

module.exports = packsStore;
