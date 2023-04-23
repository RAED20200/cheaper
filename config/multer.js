const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { v4: uuidV4 } = require("uuid");
//if want to store the image in folder and store in db then should use this

//***************  Create folders ****************** */
//? create the folder if not already exist
// ! create upload folder if not exists
if (!fs.existsSync(path.join(__dirname, "..", "upload"))) {
  fs.mkdir(path.join(__dirname, "..", "upload"), (err) => {
    if (err) {
      return console.error(err);
    }
  });
}
//create temp folder in upload folder
let tempPath = path.join(__dirname, "../upload", "temp");
///! create temp folder if not exists
if (!fs.existsSync(tempPath)) {
  //!create Temp
  fs.mkdir(tempPath, (err) => {
    if (err) {
      return console.error(err);
    }
    //is done create success
  });
}
//! create Images folder if not exists
let imagesPath = path.join(__dirname, "../upload", "images");
if (!fs.existsSync(imagesPath)) {
  // ! create Sorted folder
  fs.mkdir(imagesPath, (err) => {
    if (err) {
      return console.error(err);
    }
    //is done create success
  });

  //!create mangers folder in image folder
  fs.mkdir(path.join(__dirname, "../upload/images", "mangers"), (err) => {
    if (err) {
      return console.error(err);
    }
    //is done create success
  });
  //! create Users folder "Sorted/Users"
  fs.mkdir(path.join(__dirname, "../upload/images", "users"), (err) => {
    if (err) {
      return console.error(err);
    }
    //is done create success
  });
}

// **********************************************
//*************** Disck Storage and multer ****************** */
//filter image
const fileFilter = (req, file, cb) => {
  //should type image like .jpg,.png, .jpeg
  // if (!file.originalname.match(/\.(jpg|png|jpeg)$/))
  //  just image accepted

  if (!file.mimetype.startsWith("image")) {
    return cb(new Error("من فضلك قم برفع من نوع صورة فقط"), false);
  }
  //otherwise return success
  //mean first args is undefined error ,second args mean
  cb(null, true);
};

// config storage
module.exports.configStorage = (pathStorage) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, pathStorage);
    },
    //config filename
    filename: function (req, file, cb) {
      // console.log(file);
      let generalId = uuidV4();
      //name-date-extension
      cb(null, `${generalId}${path.extname(file.originalname)}`);
    },
  });

// crete multer with special storage path
module.exports.createMulter = (storage) =>
  multer({
    storage: storage,
    //to validate the picture
    limits: {
      //set the limited size ,measure bytes 1M byte=1e6
      fileSize: 4 * 1024 * 1024, // 4MB
      //this mean the min is 3 Mega
    },
    //filter file with specific details
    fileFilter,
  });
