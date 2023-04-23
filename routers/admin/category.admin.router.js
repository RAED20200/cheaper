let {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../../config/header_routers");

const router = require("express").Router();
const control = require("../../controllers/Admin/category.admin.controller");
const { schema } = require("../../validation/Schema/category.schema");

//create
router.post(
  "/create",
  // auth,
  // access(permissions.category.create),
  validate(schema.body, type.body),
  control.create
);

//update
router.put(
  "/update/:id",
  auth,
  // access(permissions.category.update),
  validate(schema.params, type.params), //validate params
  validate(schema.body, type.body), //validate body (name)
  control.update
);

//remove
router.delete(
  "/delete/:id",
  auth,
  // access(permissions.category.delete),
  validate(schema.params, type.params), //validate params
  control.remove
);

//get all
router.get(
  "/get-all-category", // auth,
  control.getAllCategory
);

module.exports = router;
