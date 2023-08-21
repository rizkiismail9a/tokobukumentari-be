const bookModel = require("../models/books");

async function getBooks(req, res) {
  try {
    const getBooks = await bookModel.find();
    if (!getBooks) {
      return res.sendStatus(204);
    }
    return res.status(200).send(getBooks);
  } catch (error) {
    console.log(error);
  }
}

async function searchBook(req, res) {
  const data = req.body;
  const regex = new RegExp(data.keyword, "gi");
  const resultTitle = await bookModel.find({ title: regex });
  const resultWriter = await bookModel.find({ writer: regex });
  if (resultTitle.length === 0 && resultWriter.length === 0) {
    return res.status(404).send({ message: "buku itu tidak ada" });
  }
  const allResults = resultTitle.length !== 0 ? resultTitle : resultWriter;
  return res.status(200).send(allResults);
}
module.exports = { getBooks, searchBook };
