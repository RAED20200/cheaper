var {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../../config/header_routers");

const router = require("express").Router();
const control = require("../../controllers/Admin/packs.admin.controllers");
const { schema } = require("../../validation/Schema/packs.schema");

///! validate is not work
//create
router.put(
  "/create",
  // auth,
  // access(permissions.packs.create),
  // validate(schema.body, type.body),
  control.create
);

//update
router.put(
  "/update/:id",
  auth,
  // access(permissions.packs.update),
  validate(schema.params, type.params), //validate params
  validate(schema.body, type.body), //validate body (name)
  control.update
);

//remove
router.delete(
  "/delete/:id",
  auth,
  // access(permissions.packs.delete),
  validate(schema.params, type.params), //validate params
  control.remove
);

//get all
router.get(
  "/all-packs",
  auth,
  // access(permissions.packs.getAllPacks),
  control.getAllPacks
);

module.exports = router;
