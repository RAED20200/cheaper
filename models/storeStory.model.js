require("dotenv").config({
  path: `../.env`,
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");

class storeStory extends Model {}

storeStory.init(
  {
    avatar: {
      type: DataTypes.STRING(),
      allowNull: true,
    },
  },
  {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: "storeStory", // We need to choose the model name
    timestamps: false,
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
  }
);

module.exports = storeStory;
