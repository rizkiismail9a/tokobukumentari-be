const multer = require("multer");
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    callback(null, `${new Date().getMilliseconds()}-${file.originalname.replace(/\s/g, "")}`);
  },
});

module.exports = fileStorage;
