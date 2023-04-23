const router = require("express").Router();

router.use("/auth", require("./auth.router"));

router.use("/account", require("./account.router"));

router.use("/user", require("./user/users.router"));

router.use("/store", require("./storeManger"));

router.use("/admin", require("./admin"));

router.use("/dev", require("./dev.router"));

router.use("*", (req, res) => {
  res.send("Error 404 ");
});

module.exports = router;
