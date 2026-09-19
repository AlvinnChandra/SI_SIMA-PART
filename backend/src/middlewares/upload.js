const multer = require("multer");
const path = require("path");

const allowedImageExt = [".jpg", ".jpeg", ".png"];

// diskStorage({}) tanpa destination/filename = file ditaruh di temp folder OS,
// nanti kita upload dari situ ke Cloudinary (sama seperti middlewares/multer.js)
module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        if (file.fieldname === "cv") {
            if (ext !== ".pdf") {
                return cb(new Error("File CV harus berformat PDF."), false);
            }
            return cb(null, true);
        }

        if (!allowedImageExt.includes(ext)) {
            return cb(new Error("Format file tidak didukung."), false);
        }

        cb(null, true);
    },
});