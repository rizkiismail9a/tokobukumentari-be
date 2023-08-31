const BookModel = require("../models/books");
const UserModel = require("../models/user");

async function getBooks(req, res) {
  try {
    const getBooks = await BookModel.find();
    if (!getBooks) {
      return res.sendStatus(204);
    }
    return res.status(200).send(getBooks);
  } catch (error) {
    console.log(error);
  }
}
// cari buku
async function searchBook(req, res) {
  const data = req.body;
  const regex = new RegExp(data.keyword, "gi");
  const resultTitle = await BookModel.find({ title: regex });
  const resultWriter = await BookModel.find({ writer: regex });
  const resultCetagory = await BookModel.find({ cetagory: regex });
  try {
    if (resultTitle.length === 0 && resultWriter.length === 0 && resultCetagory.length === 0) {
      return res.status(400).send({ message: "Belum punya buku itu, :'(" });
    }
    const allResults = resultTitle.length !== 0 ? resultTitle : resultWriter.length !== 0 ? resultWriter : resultCetagory;
    return res.status(200).send(allResults);
  } catch (error) {
    console.log(error);
  }
}
// ambil best selling
async function bestSelling(req, res) {
  const getBestBooks = await BookModel.find({ bestSelling: true });
  return res.status(200).send(getBestBooks);
}
// Lihat detail buku
async function seeBookDetail(req, res) {
  const bookId = req.params.id;
  const findBook = await BookModel.findById(bookId).exec();
  try {
    return res.status(200).send(findBook);
  } catch (error) {
    return res.status(404).send({ message: "Buku itu tidak ada" });
  }
}
// komentari buku
async function sendComment(req, res) {
  const bookId = req.params.id;
  const user = req.user;
  const userComment = req.body.userComment;
  if (!userComment) {
    return res.status(400).send({ message: "Komentar tidak boleh kosong" });
  }
  const findBook = await BookModel.findById(bookId).exec();
  const findUser = await UserModel.findById(user.id).select({ password: 0, refresh_token: 0, __v: 0, updated_at: 0 }).exec();
  if (!findBook) {
    return res.status(400).send({ message: "Buku tidak ditemukan di server. Jangan khawatir, ini bukan salah kamu" });
  }
  if (!findUser) {
    return res.status(400).send({ message: "user tidak ditemukan" });
  }
  try {
    // Push, karena dia, kan, array
    findBook.comments.push({ content: { userComment, user: findUser } });
    await findBook.save();
    return res.status(200).send({ message: "Komentar berhasil ditambahkan" });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
}

// Ambil komentar semua user
async function getBookComments(req, res) {
  const bookId = req.params.id;
  const findBook = await BookModel.findById(bookId).exec();
  if (!findBook) return res.sendStatus(204);
  const comments = findBook.comments;
  return res.status(200).send(comments);
}
module.exports = { getBooks, searchBook, sendComment, getBookComments, bestSelling, seeBookDetail };
