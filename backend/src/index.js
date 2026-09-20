const express = require("express");
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const dbConnect = require("./config/dbConnect");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const tokoRoutes = require("./routes/tokoRoutes");
const itemRoutes = require("./routes/itemRoutes");
const pesananRoutes = require("./routes/pesananRoutes");

// Connect to the database
dbConnect();

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "https://si-sima-part-bi89.vercel.app", // frontend di Vercel
      "http://localhost:5173", // frontend lokal (sesuaikan portnya)
    ],
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/toko", tokoRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/pesanan", pesananRoutes);

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello dari Backend!" });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(400).json({ message: err.message });
});

// Jalankan listen hanya di laptop, bukan di Vercel
const PORT = process.env.PORT || 7001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;