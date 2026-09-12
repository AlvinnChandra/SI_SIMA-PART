const multer = require("multer");
const path = require("path");
const fs = require("fs");

// sesuaikan jumlah ".." dengan lokasi file ini
// contoh: kalau file ini ada di backend/src/middlewares/upload.js
const uploadDir = path.join(__dirname, "..", "..", "uploads");

console.log("Upload folder:", uploadDir); // sementara, buat ngecek

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

module.exports = multer({ storage });