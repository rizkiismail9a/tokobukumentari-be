const express = require("express");
const router = express.Router();
const { register, login, logout, refresh, getUser, editUser, updateImg, getImage, changePassword } = require("../controllers/authControllers");
const auth = require("../middleware/auth");
const uploadImage = require("../middleware/multer");
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/getUser", auth, getUser);
router.get("/getImage/:userId", getImage);
router.put("/editUser", auth, editUser);
router.post("/uploadImage", auth, uploadImage("image"), updateImg);
router.put("/changePass", auth, changePassword);
module.exports = router;
