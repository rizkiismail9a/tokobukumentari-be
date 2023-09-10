const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getBooks, searchBook, sendComment, bestSelling, seeBookDetail } = require("../controllers/books");

router.get("/books", getBooks);
router.post("/search", searchBook);
router.post("/createComment/:id", auth, sendComment);
router.get("/bestSelling", bestSelling);
router.get("/bookDetail/:id", seeBookDetail);

module.exports = router;
