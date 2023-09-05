const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { addToCart, getCart, removeItem, addToWishlist } = require("../controllers/shopping");
router.put("/addToCart/:id", auth, addToCart);
router.get("/getCart", auth, getCart);
router.delete("/removeItem/:index", auth, removeItem);
router.patch("/addToWishlist/:id", auth, addToWishlist);
// router.put("/updateAmount", auth, updateAmount);

module.exports = router;
