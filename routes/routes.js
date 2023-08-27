const express = require("express");
const router = express.Router();
const { getBooks, searchBook } = require("../controllers/books");

router.get("/books", getBooks);
router.post("/search", searchBook);

module.exports = router;
