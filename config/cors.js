module.exports = (app) => {
  const cors = require("cors");
  // setup the cors
  app.use(cors({ origin: "*" }));
};
