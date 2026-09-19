const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const tokoRoutes = require("./routes/tokoRoutes");
const itemRoutes = require("./routes/itemRoutes");
const pesananRoutes = require("./routes/pesananRoutes");

dotenv.config();

// Connect to database
dbConnect();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/toko", tokoRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/pesanan", pesananRoutes);

app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello dari Backend!"
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(400).json({
    message: err.message
  });
});

module.exports = app;