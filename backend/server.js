require("dotenv").config(); // WAJIB ini paling atas, biar .env kebaca

const express = require("express");
const cors = require("cors");
const path = require("path");                          // + tambahan
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");  // + tambahan
const dbConnect = require("./src/config/dbConnect");

const app = express();

dbConnect();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // + tambahan

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // + tambahan, ini yang bikin /api/users/sales kepanggil

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello dari Backend!" });
});

app.listen(3000, () => {
    console.log("Backend berjalan di http://localhost:3000");
});