require("dotenv").config({ path: `./.env` });
//Import library
const express = require("express");
const app = express();
let bodyParser = require("body-parser");
const expressSanitizer = require("express-sanitizer");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

const { cleanTokens } = require("./utils/scheduler");
// parse application/json
app.use(bodyParser.json());

app.use(expressSanitizer());

//convert to JSON
app.use(express.json());

//log
require("./config/log")(app);

//cors (for front end )
require("./config/cors")(app);

// helps in securing HTTP headers.
app.use(require("helmet")());

//Router
const router = require("./routers");
app.use(router);

app.get("/*", function (req, res) {
  // console.log("not found page ");
  res.status(404).send("Error 404");
});
// // ?if you want to create or update database execute this code
// const sequelize = require("./utils/connect");
// //use to create all relations with table
// require("./models/relations");

// //save edit in databases
// sequelize
//   .sync({ force: true })
//   .then(async () => {
//     const default_data = require("./utils/default_data");
//     await default_data();
//     console.log("successfully create or Updated tables attribute ✅ ✔✅🎉 ");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

//run at port
app.listen(process.env.PORT, async () => {
  await cleanTokens();
  console.log(`Server Run of Port : ${process.env.PORT}  ✔✅`);
});
