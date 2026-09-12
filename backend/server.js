require("dotenv").config(); // WAJIB ini paling atas, biar .env kebaca

const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const dbConnect = require("./src/config/dbConnect"); // sesuaikan path-nya

const app = express();

dbConnect(); // <-- panggil koneksi database di sini

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello dari Backend!" });
});

app.listen(3000, () => {
    console.log("Backend berjalan di http://localhost:3000");
});