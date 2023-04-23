const packs = require("./packs.model");
const token = require("./tokenTable.model");
const offersUser = require("./offersUser.model");
const banList = require("./banList.model");
const spams = require("./spams.model");
const banListUser = require("./banListUser.model");
const users_Pivot_category = require("./users_Pivot_category");
const packsStore = require("./packsStore.model");
const store = require("./store.model");
const offer = require("./offer.model");
const user = require("./user.model");
const category = require("./category.model");
const role = require("./role.model");
const notification = require("./notification.model");
const storeStory = require("./storeStory.model");

//! User has many-to-many category
user.belongsToMany(category, {
  // belongsToMany with sequelize example with option ?
  through: users_Pivot_category,
  hooks: true,
});
category.belongsToMany(user, {
  through: users_Pivot_category,
  hooks: true,
});

//! User has many-to-many pack
store.hasMany(packsStore, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
packsStore.belongsTo(store);

packs.hasMany(packsStore, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
packsStore.belongsTo(packs);

//!   Store has one - to - many pic info (some url of product avatar)
store.hasMany(offer, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
offer.belongsTo(store);

// //! User has many-to-many offer
user.hasMany(offersUser, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
offersUser.belongsTo(user);

offer.hasMany(offersUser, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
offersUser.belongsTo(offer);

//! spams
user.hasMany(spams, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
spams.belongsTo(user);

offer.hasMany(spams, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
spams.belongsTo(offer);

// //! category has one-to-many stores
//if delete the category then will delete the all store
category.hasMany(store, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
store.belongsTo(category);

//! roles has one-to-many users
//if delete the role then will delete the all user have like this role
role.hasMany(user, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
user.belongsTo(role);

//! users has one-to-many notifications
user.hasMany(notification, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
notification.belongsTo(user);

// //! User and ban_list
user.hasMany(banListUser, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
banListUser.belongsTo(user);

banList.hasMany(banListUser, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
banListUser.belongsTo(banList);

//if delete the user account then will delete the store
user.hasMany(store, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
store.belongsTo(user);

user.hasMany(token, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
token.belongsTo(user);

store.hasMany(storeStory, {
  constraints: true,
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
  hooks: true,
});
storeStory.belongsTo(store);
