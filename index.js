// pemanggillan package npm atau module
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const corsOption = require("./config/cors");
const credentials = require("./middleware/credentials");
const reqMiddleware = require("./middleware/reqMiddleware");
// Ini buat apa? Ini supaya route ke file statis di dalam server bisa diakses
const path = require("path");
// pemakaian package/module
const port = process.env.PORT || 3000;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(reqMiddleware);
app.use(credentials);
app.use(cors(corsOption));

// Ini untuk handle upload gambar
// multer, configurasi penyimpanannya ada di fileStorage, fileFilter-nya ada di variable fileFilter. Upload yang akan diunggah itu cuma satu(single)
// 'image maksudnya adalah req.file.image, nama request file-nya harus image
// app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
const MONGODB_URL = process.env.MONGODB_URL;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// router
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/products", require("./routes/bookRoutes"));
app.use("/auth", require("./routes/authRoutes"));
app.use("/api/shop", require("./routes/shopRoutes"));
app.all("*", (req, res) => {
  res.status(404).send({ message: "Halaman itu tidak ada" });
});
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Aplikasi berjalan di port ${port}`);
  });
});
