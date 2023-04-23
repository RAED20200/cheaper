let {
  auth,
  access,
  permissions,
  type,
  validate,
} = require("../../config/header_routers");
const control = require("../../controllers/stores.controllers");
const { schema } = require("../../validation/Schema/store.schema");
const router = require("express").Router();
const { uploadImage } = require("../../middleware/uploadImage");
/*
avatars :
*****  Manger  ******
for avatar store => avatar_store ,field "avatar_store"
for avatar account =>  avatar_account, field "avatar_account"
for story store => story_store ,field "story_store"
for avatar offers => avatar_offers,field "avatar_offers"
***** User *******
for avatar account => avatar ,field "avatar"
*/

//update
router.put(
  "/update",
  auth,
  // lockRouter(permissions.ban_list.create),
  uploadImage("avatar_store"),
  // access(permissions.store.update),
  validate(schema.body, type.body),
  control.update
);

//update
router.get(
  "/all-info",
  auth,
  // access(permissions.store.update),
  // lockRouter(permissions.ban_list.create),
  // validate(schema.body, type.body),
  control.getAllInfo
);

//choose pack
router.put(
  "/choose-pack/:id",
  auth,
  // access(permissions.store.choosePackStore),
  // lockRouter(permissions.ban_list.create),
  // validate(schema.params.idJust, type.params),
  control.choosePack
);

//packs
router.delete(
  "/delete-pack/:id",
  auth,
  // access(permissions.store.deletePackStore),
  // lockRouter(permissions.ban_list.create),
  validate(schema.params.idJust, type.params),
  control.disablePack
);

//get all packs to store
router.get(
  "/all-packs",
  auth,
  // access(permissions.store.getPacksStore),
  // lockRouter(permissions.ban_list.create),
  control.getPacks
);

//! avatar store
//upload picture
router.post(
  "/upload",
  auth,
  access(permissions.store.uploadImage),
  // lockRouter(permissions.ban_list.create),
  uploadImage("avatar_store"),
  control.uploadImage
);
//delete picture
router.delete(
  "/delete-pic",
  auth,
  // access(permissions.store.deleteImage),
  // lockRouter(permissions.ban_list.create),
  control.deleteImage
);

//get picture
router.get(
  "/pic",
  auth,
  // access(permissions.store.getImage),
  // lockRouter(permissions.ban_list.create),
  control.getImage
);

//! store story
//upload story
router.post(
  "/upload-story",
  auth,
  // access(permissions.store.uploadStory),
  // lockRouter(permissions.ban_list.create),
  uploadImage("story_store"),
  control.uploadStory
);
//update-story
router.put(
  "/update-story/:id",
  auth,
  // access(permissions.store.updateStory),
  // lockRouter(permissions.ban_list.create),
  uploadImage("update_story_store"),
  ///!here should remove the recent image

  control.updateStory
);

//all-story
router.get(
  "/all-story",
  auth,
  // access(permissions.store.getAllStory),
  // lockRouter(permissions.ban_list.create),
  control.getAllStory
);
//get-story
router.get(
  "/get-story/:id",
  auth,
  // access(permissions.store.getImagesStory),
  // lockRouter(permissions.ban_list.create),
  control.getSpecialStory
);
//delete story
router.delete(
  "/delete-story/:id",
  auth,
  // access(permissions.store.deleteStory),
  // lockRouter(permissions.ban_list.create),
  control.deleteStory
);

//delete story
router.delete(
  "/delete-story",
  auth,
  // access(permissions.store.deleteAllStory),
  // lockRouter(permissions.ban_list.create),
  control.deleteAllStory
);

module.exports = router;
