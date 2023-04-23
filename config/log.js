module.exports = (app) => {
  var fs = require("fs");
  var morgan = require("morgan");
  var path = require("path");
  // create a write stream (in append mode)
  var accessLogStream = fs.createWriteStream(
    path.join(__dirname, "../log/access.log"),
    {
      interval: "1d", // rotate daily
      flags: "a",
    }
  );
  // setup the logger
  app.use(
    morgan(
      ':req[header] - :res[header] -:remote-addr - :remote-user [:date[web]]  :method :status :url " HTTP/:http-version"  :res[content-length] "response-time:" :response-time ms  ',
      {
        stream: accessLogStream,
      }
    )
  );
};
