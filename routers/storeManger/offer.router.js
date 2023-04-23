let {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../../config/header_routers");

const router = require("express").Router();
const control = require("../../controllers/offer.controller");
const { schema } = require("../../validation/Schema/offer.schema");

router.post(
  "/add",
  auth,
  // access(permissions.category.create),
  // lockRouter(permissions.ban_list.create),
  validate(schema.body.modify, type.body),
  control.add
);

router.put(
  "/update/:id",
  auth,
  // access(permissions.category.update),
  // lockRouter(permissions.ban_list.create),
  validate(schema.params, type.params),
  validate(schema.body.modify, type.body),
  control.update
);

router.delete(
  "/delete/:id",
  auth,
  // access(permissions.category.delete),
  // lockRouter(permissions.ban_list.create),
  validate(schema.params, type.params),
  control.delete
);

router.put(
  "/disable/:id",
  auth,
  // access(permissions.category.update),
  // lockRouter(permissions.ban_list.create),
  validate(schema.params, type.params),
  control.disable
);

router.put(
  "/enable/:id",
  auth,
  // access(permissions.category.update),
  // lockRouter(permissions.ban_list.create),
  validate(schema.params, type.params),
  control.enable
);

router.get(
  "/all",
  auth,
  // access(permissions.category.update),
  // lockRouter(permissions.ban_list.create),
  control.all
);

router.put(
  "/verify",
  auth,
  // access(permissions.store.deleteAllStory),
  // lockRouter(permissions.ban_list.create),
  validate(schema.body.verify, type.body),
  control.verifyOffer
);

router.get(
  "/users-offer/:id",
  auth,
  // access(permissions.store.deleteAllStory),
  // lockRouter(permissions.ban_list.create),
  // validate(schema.body.verify, type.body),
  control.usersOfOffer
);
module.exports = router;
