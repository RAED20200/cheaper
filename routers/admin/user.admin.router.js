var {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../../config/header_routers");

const router = require("express").Router();
const control = require("../../controllers/Admin/user.admin.controller");
// const { schema } = require("../../validation/Schema/packs.schema");

// get all users
router.get(
  "/all-users",
  auth,
  // access(permissions.user.all),
  control.getAllUsers
);

router.get(
  "/more-details/:id",
  auth,
  // access(permissions.user.all),
  control.getMoreDetails
);
// get all users
// router.get(
//   "/all-users",
//   auth,
//   // access(permissions.user.all),
//   control.getAllManger
// );

router.get(
  "/search",
  auth,
  // access(permissions.store.all),
  // validate(schema.body, type.body),
  control.search
);
module.exports = router;
