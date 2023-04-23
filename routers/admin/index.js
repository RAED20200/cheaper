const router = require("express").Router();

router.use("/packs", require("./packs.admin.router"));

router.use("/category", require("./category.admin.router"));

router.use("/roles", require("./role.admin.router"));

router.use("/users", require("./user.admin.router"));

router.use("/stores", require("./store.admin.router"));

router.use("/spams", require("./spams.admin.router"));

router.use("/ban-list", require("./ban_list.admin.router"));

module.exports = router;
