require("dotenv").config({
  path: "../.env",
});
const sequelize = require("../utils/connect"); //use to connect with database
const { DataTypes, Model } = require("sequelize");

class banList extends Model {}

banList.init(
  {
    reason: {
      type: DataTypes.STRING(300),
      notEmpty: true,
      allowNull: false,
      unique: "Unique_Fields",
      validate: {
        len: [2, 300],
        notEmpty: {
          msg: "لا يمكنك ترك حقل لسبب فارغ ",
        },
      },
      set(value) {
        // console.log(1);
        this.setDataValue("reason", value.trim());
      },
    },
    restrictions: {
      type: DataTypes.JSON,
      allowNull: false,
      set(value) {
        this.setDataValue("restrictions", value.trim());
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    sequelize,
    timestamps: false,
    tableName: "banList",
  }
);

module.exports = banList;
