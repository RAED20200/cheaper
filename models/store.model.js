require("dotenv").config({
  path: `../.env`,
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
const moment = require("moment");

class store extends Model {}

store.init(
  {
    nameStore: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        len: [2, 255], //mean min length  4 and max  length 10
        notEmpty: true,
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
        ],
      },
      set(value) {
        this.setDataValue("nameStore", value.trim());
      },
    },
    avatar: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
    fromHour: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    toHour: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    requestDelete: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    longitude: {
      allowNull: false,
      type: DataTypes.FLOAT(10, 6),
    },
    latitude: {
      allowNull: false,
      type: DataTypes.FLOAT(10, 6),
    },
    //If account is disable
    unavailableAt: {
      type: DataTypes.DATE,
      allowNull: true,
      isDate: true,
      get() {
        if (this.getDataValue("unavailableAt"))
          return moment
            .utc(this.getDataValue("unavailableAt"))
            .format("YYYY-MM-DD");
      },
      validate: {
        isDate: {
          msg: "is not Date",
        },
      },
    },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: "store", // We need to choose the model name
    timestamps: false,
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
    paranoid: true,
    deletedAt: "unavailableAt",
  }
);

module.exports = store;
