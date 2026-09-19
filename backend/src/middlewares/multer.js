const multer = require("multer");
const path = require("path");

const allowedImageExt = [".jpg", ".jpeg", ".png", ".webp"];

// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedImageExt.includes(ext)) {
      cb(new Error("File type is not supported"), false);
      return;
    }
    cb(null, true);
  },
});