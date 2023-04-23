let {
  auth,
  access,
  permissions,
  validate,
  type,
} = require("../config/header_routers");

const router = require("express").Router();
const control = require("../controllers/account.controllers");
const { schema } = require("../validation/schema/account.schema");
const { uploadImage } = require("../middleware/uploadImage");
//! image
/*
 * @account
 * @public
 * @method POST
 * @work upload Image
 */
router.post(
  "/upload",
  auth,
  // access(permissions.account.uploadImage),
  // lockRouter(permissions.ban_list.create),
  uploadImage("avatar"),
  control.uploadImage
);

/*
 * @account
 * @public
 * @method POST
 * @work delete Image
 */
router.delete(
  "/delete-pic",
  auth,
  // access(permissions.account.deleteImage),
  // lockRouter(permissions.ban_list.create),
  control.deleteImage
);

/*
 * @account
 * @public
 * @method POST
 * @work get Image
 */
router.get(
  "/pic",
  auth,
  // access(permissions.account.getImage),
  // lockRouter(permissions.ban_list.create),
  control.getImage
);

/*
 * @account
 * @public
 * @method POST
 * @work remove account
 */
router.delete(
  "/remove",
  auth,
  access(permissions.account.delete),
  // lockRouter(permissions.ban_list.create),
  control.remove
);

/*
 * @account
 * @public
 * @method POST
 * @work change password
 */
router.put(
  "/ch-pass",
  auth,
  // access(permissions.account.changePassword),
  // lockRouter(permissions.ban_list.create),
  validate(schema.body.changePassword, type.body),
  control.changePassword
);
/*
 * @account
 * @public
 * @method POST
 * @work change phone number 1
 */
router.put(
  "/ch-phone",
  auth,
  // access(permissions.account.changePhone),
  // lockRouter(permissions.ban_list.create),
  validate(schema.body.ch_phon, type.body),
  control.changePhone
);

/*
 * @account
 * @public
 * @method POST
 * @work change email
 */

router.put(
  "/ch-email",
  auth,
  // access(permissions.account.changeEmail),
  // lockRouter(permissions.ban_list.create),
  validate(schema.body.ch_email, type.body),
  control.editEmail
);
router.put(
  "/verify-email",
  auth,
  // access(permissions.account.changeEmail),
  // lockRouter(permissions.ban_list.create),
  validate(schema.body.verify_email, type.body),
  control.verifyEmail
);
router.get(
  "/profile",
  auth,
  // lockRouter(permissions.ban_list.create),
  //not should check authO because every user can access
  control.getProfile
);
router.put(
  "/update",
  auth,
  // access(permissions.account.update),
  // lockRouter(permissions.ban_list.create),
  uploadImage("avatar", "update account"),
  validate(schema.body.update, type.body),
  control.update
);
module.exports = router;
