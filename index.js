// pemanggillan package npm atau module
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const router = require("./routes/routes");
const corsOption = require("./corsConfig/cors");
const credentials = require("./middleware/credentials");
const reqMiddleware = require("./middleware/reqMiddleware");
// pemakaian package/module
const port = process.env.PORT || 8000;
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(reqMiddleware);
app.use(credentials);
app.use(cors(corsOption));
const MONGODB_URL = process.env.MONGODB_URL;
mongoose.connect(MONGODB_URL, { useNewURLParser: true, useUnifiedTopology: true });

// router
app.use("/api/products", router);
app.use("/auth", router);
app.all("*", (req, res) => {
  res.status(404).send({ message: "Halaman itu tidak ada" });
});
mongoose.connection.once("open", () => {
  console.log("Berhasil terhubung ke database");
  app.listen(port, () => {
    console.log(`Aplikasi berjalan di port ${port}`);
  });
});
