require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const tokoRoutes = require("./src/routes/tokoRoutes");
const dbConnect = require("./src/config/dbConnect");

const app = express();

dbConnect();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/toko", tokoRoutes);

app.get("/api/hello", (req, res) => {
    res.json({ message: "Hello dari Backend!" });
});

app.listen(3000, () => {
    console.log("Backend berjalan di http://localhost:3000");
});