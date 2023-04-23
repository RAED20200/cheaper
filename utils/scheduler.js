var cron = require("node-cron");
const tokenTable = require("../models/tokenTable.model");
const { Op } = require("sequelize");

module.exports.cleanTokens = async () => {
  let task = cron.schedule("1-3 1 0 * * * *", async () => {
    let expiredTokens = await tokenTable.findAll({
      attributes: ["id"],
      where: {
        expiresAt: {
          [Op.lt]: new Date(),
        },
      },
    });
    await Promise.all(expiredTokens.map((record) => record.destroy()));
  });
  task.start();
};

module.exports.emailSchedule = async () => {
  // let task = cron.schedule("1-3 1 0 * * * *", async () => {
  //   let expiredTokens = await tokenTable.findAll({
  //     attributes: ["id"],
  //     where: {
  //       expiresAt: {
  //         [Op.lt]: new Date(),
  //       },
  //     },
  //   });
  //   await Promise.all(expiredTokens.map((record) => record.destroy()));
  // });
  // task.start();
};
