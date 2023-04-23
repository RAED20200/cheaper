let {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../../config/header_routers");
const control = require("../../controllers/Admin/ban_list.admin.controller");
const { schema } = require("../../validation/Schema/ban_list.schema");

const { lockRouter } = require("../../middleware/lockRouter");
const router = require("express").Router();

//create
router.post(
  "/create",
  // auth,
  // access(permissions.ban_list.create),
  // lockRouter(permissions.ban_list.create),
  // validate(schema.body.modify, type.body),
  control.create
);

//update
router.put(
  "/update/:id",
  // auth,
  // access(permissions.ban_list.update),
  validate(schema.params, type.params),
  validate(schema.body.modify, type.body),
  control.update
);

//remove
router.delete(
  "/delete/:id",
  // auth,
  // access(permissions.ban_list.delete),
  validate(schema.params, type.params),
  control.remove
);

//get all ban_list
router.get(
  "/get-all-ban",
  // auth,
  // access(permissions.ban_list.all),
  control.getAll
);

//block manger
router.post(
  "/block",
  // auth,
  // access(permissions.ban_list.blockManger),
  validate(schema.body.blocking, type.body),
  control.blockManger
);
// un block manger
router.put(
  "/un-block",
  // auth,
  // access(permissions.ban_list.blockManger),
  validate(schema.body.blocking, type.body),
  control.unBlockManger
);

// un block manger
router.put(
  "/un-block-all/:id",
  // auth,
  // access(permissions.ban_list.blockManger),
  validate(schema.params, type.params),
  control.unBlockAllForManger
);

// all Block Record for manger
router.get(
  "/all-block-record/:id",
  // auth,
  // access(permissions.ban_list.blockManger),
  validate(schema.params, type.params),
  control.allBlockRecordManger
);

// all Block Record for manger
router.delete(
  "/remove-all-block-record/:id",
  // auth,
  // access(permissions.ban_list.blockManger),
  validate(schema.params, type.params),
  control.removeAllBlockRecord
);

// all Block Record for manger
router.get(
  "/all-block-record-every",
  // auth,
  // access(permissions.ban_list.blockManger),
  control.allBlockRecordEvery
);

module.exports = router;
