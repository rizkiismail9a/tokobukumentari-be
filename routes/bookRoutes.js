const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getBooks, searchBook, sendComment, getBookComments } = require("../controllers/books");

router.get("/books", getBooks);
router.post("/search", searchBook);
router.post("/comment/:id", auth, sendComment);
router.get("/getcomments/:id", getBookComments);

module.exports = router;
