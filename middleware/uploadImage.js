const { StatusCodes } = require("http-status-codes");
let { configUpload, removeAvatars } = require("../utils/helper");

//use to upload image from client to server and save it in images folder
module.exports.uploadImage = (fieldUpload, type) => {
  return async (req, res, next) => {
    try {
      let showError = (err) => {
        try {
          if (err) {
            if (err.code === "LIMIT_FILE_SIZE")
              throw Error("حجم الصورة اكبر من الحجم المطلوب ");
            else if (err.code === "LIMIT_UNEXPECTED_FILE")
              throw Error("الرجاء التاكد من ادخالات الصور بلشكل الصحيح ");
            else if (err) throw Error(err.message);
          }
          next();
        } catch (error) {
          return res
            .status(StatusCodes.BAD_REQUEST)
            .send({ success: false, error: error.message });
        }
      };
      //for config upload
      let upload = await configUpload(req, fieldUpload, type);

      upload(req, res, showError);
    } catch (error) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send({ success: false, error: error.message });
    }
  };
};
