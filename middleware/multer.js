const multer = require("multer");
// const multerConfig = require("../config/multer");

function uploadImage(imageFile) {
  const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "images");
    },
    filename: (req, file, callback) => {
      callback(null, `${new Date().getMilliseconds()}-${file.originalname.replace(/\s/g, "")}`);
    },
  });
  const fileFilter = function (req, file, cb) {
    if (file.fieldname === imageFile) {
      if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = {
          message: "Hanya boleh upload gambar saja, ya",
        };
        return cb(new Error("Hanya boleh upload gambar saja, ya"), false);
      }
    }
    cb(null, true);
  };
  const maxSize = 10000000; //10^7 bytes atau 10mb
  const upload = multer({ storage: fileStorage, fileFilter, limits: { fileSize: maxSize } }).single(imageFile);
  return (req, res, next) => {
    upload(req, res, function (err) {
      if (req.fileValidationError) return res.status(400).send(req.fileValidationError);

      if (!req.file && !err)
        return res.status(400).send({
          message: "Kamu belum upload gambar apapun",
        });

      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).send({
            message: "Gambar melebihi ukuran maksimum 10Mb",
          });
        }
        return res.status(400).send(err);
      }

      return next();
    });
  };
}

module.exports = uploadImage;
