const { auth } = require("../middleware/auth");
const { access } = require("../middleware/access");
const { permissions } = require("./permissions");
const { type } = require("../validation/typeValidation");
const { validate } = require("../validation/validation");
const { lockRouter } = require("../middleware/lockRouter");
module.exports = { auth, access, permissions, type, validate, lockRouter };
