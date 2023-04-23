require("dotenv").config({
  path: `../.env`,
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");
class offersUser extends Model {}
offersUser.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    offerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    QR: {
      type: DataTypes.STRING(400),
      allowNull: true,
      set(value) {
        this.setDataValue("QR", value.trim());
      },
    },
    //* createdAt , mean from this filed i can calc the Expiry date
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      isDate: true,
    },
  },
  {
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: "offersUser", // We need to choose the model name
    deletedAt: "dataTake",
    timestamp: true,
    updatedAt: false,
    paranoid: true,
  }
);
module.exports = offersUser;
