let {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../../config/header_routers");

const router = require("express").Router();
const control = require("../../controllers/users.controllers");
const { schema } = require("../../validation/schema/user.schema");

router.post(
  "/add-spam/:id",
  auth,
  // access(),
  // lockRouter(permissions.ban_list.create),

  validate(schema.params, type.params),
  validate(schema.body.addSpam, type.body),
  control.addSpam
);

router.get(
  "/all-offer",
  auth,
  // access(),
  // lockRouter(permissions.ban_list.create),
  control.allMyOffer
);

router.get(
  "/choose-offer",
  auth,
  // access(),
  // lockRouter(permissions.ban_list.create),
  control.chooseOffer
);

router.put(
  "/gift/:id",
  auth,
  // access(),
  validate(schema.params, type.params),
  validate(schema.body.gift, type.body),
  control.gift
);

module.exports = router;
