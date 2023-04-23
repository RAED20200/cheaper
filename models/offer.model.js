require("dotenv").config({
  path: `../.env`,
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");

class offer extends Model {}

offer.init(
  {
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: "unique_fields",
      set(value) {
        this.setDataValue("title", value.trim());
      },
    },
    description: {
      type: DataTypes.STRING(300),
      unique: "unique_fields",
      allowNull: true,
      set(value) {
        this.setDataValue("description", value.trim());
      },
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "unique_fields",
      min: 1,
      max: 99,
      validate: {
        notEmpty: {
          msg: "لا يمكنك ترك قيمة الخصم فارغة",
        },
      },
    },
    type: {
      type: DataTypes.BOOLEAN,
      unique: "unique_fields",
      allowNull: false,
    },
  },

  {
    freezeTableName: true, //use to save model with the name User , without set 's' at the end of name
    sequelize, // We need to pass the connection instance
    tableName: "offer",
    timestamps: true,
    updatedAt: false,
    paranoid: true,
    deletedAt: "disableAt",
  }
);

module.exports = offer;
