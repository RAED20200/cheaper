require("dotenv").config({
  path: "../.env",
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");

class tokenTable extends Model {}

tokenTable.init(
  {
    token: {
      type: DataTypes.STRING(400),
      notEmpty: true,
      allowNull: false,
    },
    browser: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    system: { type: DataTypes.STRING, allowNull: false },
    device: { type: DataTypes.STRING, allowNull: false },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },

  {
    freezeTableName: true,
    sequelize,
    tableName: "tokenTable",
    timestamps: true,
    createdAt: "logInDate",
    updatedAt: false,
    underscored: false,
  }
);

module.exports = tokenTable;
