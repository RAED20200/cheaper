let {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../../config/header_routers");
const control = require("../../controllers/Admin/roles.admin.controllers");
const { schema } = require("../../validation/Schema/role.schema");

const router = require("express").Router();

//create role
router.post(
  "/create",
  // access(permissions.role.create),
  validate(schema.body, type.body),
  control.create
);

//update
router.put(
  "/update/:id",
  auth,
  // access(permissions.role.update),
  validate(schema.params, type.params),
  validate(schema.body, type.body),
  control.update
);

//remove
router.delete(
  "/delete/:id",
  auth,
  // access(permissions.role.delete),
  validate(schema.params, type.params),
  control.remove
);

//get all role
router.get(
  "/get-all-role",
  // auth,
  // access(permissions.role.all),
  control.getAllRole
);

module.exports = router;
