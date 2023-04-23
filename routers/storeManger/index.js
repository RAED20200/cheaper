const router = require("express").Router();

router.use(require("./store.router"));

router.use("/offer", require("./offer.router"));

module.exports = router;
