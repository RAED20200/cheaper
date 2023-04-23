var {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../../config/header_routers");

const router = require("express").Router();
const control = require("../../controllers/Admin/store.admin.controller");
const { schema } = require("../../validation/Schema/admin/store.admin.schema");

// get all store
router.get(
  "/all-store",
  auth,
  // access(permissions.store.all),
  control.getAllStore
);

// get all store
router.get(
  "/all-new",
  auth,
  // access(permissions.store.all),
  control.getAllNew
);
// get all store
router.put(
  "/accept-store",
  auth,
  // access(permissions.store.all),
  validate(schema.body, type.body),

  control.acceptStore
);
// get all store
router.delete(
  "/delete-store",
  auth,
  // access(permissions.store.all),
  validate(schema.body, type.body),
  control.deleteStore
);

module.exports = router;
