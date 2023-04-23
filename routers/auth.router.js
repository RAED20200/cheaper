let { auth, validate, type } = require("../config/header_routers");

const control = require("../controllers/auth.controllers");
const router = require("express").Router();
const { schema } = require("../validation/Schema/auth.schema");
const { uploadImage } = require("../middleware/uploadImage");
/*
 * @auth controllers
 * public
 * @method POST
 * @work sign in as manger store
 */
router.post(
  "/signup-manger",
  //for upload image to local storage
  uploadImage("avatars"),
  validate(schema.signInManger, type.body),
  control.signUpManger
);

/*
 * @auth controllers
 * public
 * @method POST
 * @work sign in as user
 */
router.post(
  "/signup",
  validate(schema.signInUser, type.body),
  control.signUpUser
);

/*
 * @auth controllers
 * public
 * @method POST
 * @work login
 */
router.post("/login", validate(schema.logIn, type.body), control.login);

/*
 * @auth controllers
 * public
 * @method GET
 * @work logout
 */
router.get("/logout", auth, control.logout);

module.exports = router;
