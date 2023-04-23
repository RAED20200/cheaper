let { type, validate } = require("../config/header_routers");
const control = require("../controllers/dev.controllers");
const { schema } = require("../validation/schema/dev.schema");
const router = require("express").Router();

router.get(
  "/check-username",
  validate(schema.body.check_username, type.body),
  control.checKUsername
);
router.get(
  "/check-phone",
  validate(schema.body.check_phone, type.body),
  control.checKPhoneNumber
);

router.get(
  "/check-email",
  validate(schema.body.check_email, type.body),
  control.checKEmail
);

router.get("/all-category", control.allCategory);

module.exports = router;
