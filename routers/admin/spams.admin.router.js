let {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../../config/header_routers");

const router = require("express").Router();
const control = require("../../controllers/Admin/spam.admin.controller");
const { schema } = require("../../validation/schema/spams.schema");

router.get(
  "/spams-store",
  auth,
  // access(),
  validate(schema.body.get_spams, type.body),
  control.AllSpamsForStore
);

router.get(
  "/all",
  auth,
  // access(),
  control.AllStoreAndCount
);

module.exports = router;
