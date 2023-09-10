const UserModel = require("../models/user");
const BookModel = require("../models/books");

async function addToCart(req, res) {
  const bookId = req.params.id;
  const user = req.user;
  const findUser = await UserModel.findById(user.id).exec();
  // cek apakah buku itu sudah ada di keranjang user
  const findBook = await BookModel.findById(bookId).select({ comments: 0 }).exec();
  if (!findBook) {
    return res.status(404).send({ message: "Buku tidak ada atau sudah habis" });
  }
  const filter = findUser.cart.filter((item) => {
    return item.book.title === findBook.title;
  });

  if (filter.length !== 0) {
    return res.status(400).send({ message: "Buku itu sudah ada di keranjang, yuk checkout!" });
  }
  if (!findUser) {
    return res.status(404).send({ message: "User tidak ditemukan" });
  }
  try {
    // Simpan buku ke array cart
    findUser.cart.push({ book: findBook, amount: 1 });
    await findUser.save();
    return res.status(200).send({ message: "Buku berhasil meluncur ke keranjang" });
  } catch (error) {
    console.log(error);
    return res.send({ message: "Ada kesalahan di server. Tenang, bukan salah kamu, kok :D" });
  }
}

async function getCart(req, res) {
  const user = req.user;
  const findUser = await UserModel.findById(user.id).exec();
  if (!findUser) {
    return res.status(44).send({ message: "User tidak ditemukan" });
  }
  try {
    return res.status(200).send(findUser.cart);
  } catch (error) {
    console.log(error);
    return res.send({ message: "Ada kesalahan di server. Tenang, bukan salah kamu, kok :D" });
  }
}
async function removeItem(req, res) {
  // ambil index buku di dalam array of object
  const bookIndex = req.params.index;
  const user = req.user;
  const findUser = await UserModel.findById(user.id).exec();
  try {
    findUser.cart.splice(bookIndex, 1);
    await findUser.save();
    return res.status(200).send({ message: "Buku berhasil dihapus dari keranjang" });
  } catch (error) {
    console.log(error);
    return res.send({ message: "Ada kesalahan di server. Tenang, bukan salah kamu, kok :D" });
  }
}
module.exports = { addToCart, getCart, removeItem };
