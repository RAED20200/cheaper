const { StatusCodes } = require("http-status-codes");
module.exports.access = (permission) => {
  return (req, res, next) => {
    try {
      let allPermission = JSON.parse(req.role.data).permission;
      // console.log(allPermission);
      if (!allPermission.includes(permission))
        throw Error("Access Denied / Unauthorized request");
      next();
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).send({
        success: false,
        error: err.message,
      });
    }
  };
};
