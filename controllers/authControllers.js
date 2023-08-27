const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
// daftar
async function register(req, res) {
  const data = req.body;
  if (!data.username || !data.email || !data.full_name || !data.password || !data.password_confirm) {
    return res.status(400).send({ message: "form isian tidak boleh kosong" });
  }
  const isUserExists = await UserModel.findOne({ username: data.username }).exec();
  const isEmailUsed = await UserModel.findOne({ email: data.email }).exec();
  if (isEmailUsed || isUserExists) {
    return res.status(400).send({ message: "email atau username itu sudah dipakai" });
  }
  if (data.password !== data.password_confirm) {
    return res.status(400).send({ message: "konfirmasi kata sandi salah" });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(data.password, salt);
    const newUser = {
      username: data.username,
      email: data.email,
      full_name: data.full_name,
      password: hashedPass,
    };
    await UserModel.create(newUser);
    return res.status(201).send({ message: "Pendaftaran berhasil!" });
  } catch (error) {
    console.log(error);
  }
}

// login
async function login(req, res) {
  const data = req.body;
  if (!data.identity || !data.password) {
    return res.status(400).send({ message: "form isian tidak boleh kosong" });
  }
  const isUserExists = (await UserModel.findOne({ username: data.identity }).exec()) || (await UserModel.findOne({ email: data.identity }).exec());
  if (!isUserExists) {
    return res.status(400).send({ message: "Akun tidak ditemukan" });
  }
  const isPassCorrect = await bcrypt.compare(data.password, isUserExists.password);
  if (!isPassCorrect) {
    return res.status(400).send({ message: "Email atau kata sandi salah" });
  }
  try {
    const accessToken = jwt.sign(
      {
        id: isUserExists.id,
      },
      process.env.JWT_ACCESS,

      {
        expiresIn: "30s",
      }
    );
    const refreshToken = jwt.sign(
      {
        id: isUserExists.id,
      },
      process.env.JWT_REFRESH,
      {
        expiresIn: "30d",
      }
    );
    isUserExists.refresh_token = refreshToken;
    await isUserExists.save();
    res.cookie("papoi", refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: "None", secure: true });
    return res.status(200).send({ access_token: accessToken });
  } catch (error) {
    console.log(error);
  }
}

// logout
async function logout(req, res) {
  const cookies = req.cookies;
  if (!cookies.papoi) return res.sendStatus(204);
  const isUserExists = await UserModel.findOne({ refresh_token: cookies.papoi }).exec();
  if (!isUserExists) {
    res.clearCookie("papoi", { httpOnly: true, sameSite: "None", secure: true });
    return res.status(204).send({ message: "akun tidak ditemukan, mungkin refresh token terhapus atau ter-reset" });
  }
  isUserExists.refresh_token = null;
  await isUserExists.save();
  res.clearCookie("papoi", { httpOnly: true, sameSite: "None", secure: true });
  return res.status(200).send({ message: "Sampai jumpa lagi!" });
}

// Buat token baru
async function refresh(req, res) {
  const cookies = req.cookies;
  if (!cookies.papoi) return res.sendStatus(401);
  const isUserExists = await UserModel.findOne({ refresh_token: cookies.papoi }).exec();
  if (!isUserExists) {
    return res.sendStatus(401);
  }
  try {
    jwt.verify(cookies.papoi, process.env.JWT_REFRESH, (err, decoded) => {
      if (err || !decoded.id || !isUserExists.id) {
        console.log(err);
        return res.sendStatus(401);
      }
      const newAccessToken = jwt.sign(
        {
          id: decoded.id,
        },
        process.env.JWT_ACCESS,
        {
          expiresIn: "1800s",
        }
      );
      return res.status(200).send({ access_token: newAccessToken });
    });
  } catch (error) {
    console.log(error);
  }
}

// Ambil data diri user
async function getUser(req, res) {
  const userProfile = req.user;
  return res.status(200).send(userProfile);
}

// Update data user selai foto profil
async function editUser(req, res) {
  // cek apakah ada inputan yang masuk
  const data = req?.body;
  // kita hanya akan ambil url dari file-nya saja

  if (!data.username || !data.email || !data.full_name) {
    return res.status(400).send({ message: "form isian tidak boleh kosong" });
  }
  // cek apakah user login atau tidak
  const user = req?.user;
  if (!user) {
    return res.status(401).send({ message: "Kamu tidak punya akses ke sini" });
  }

  // Cek apakah data yang dikirim oleh user sudah ada yang pakai

  const isEmailUsed = await UserModel.findOne({ email: data.email }).exec();
  if (isEmailUsed && isEmailUsed?.id !== user?.id) {
    return res.status(400).send({ message: "Username atau Email itu sudah ada yang pakai" });
  }
  const isUsernameUsed = await UserModel.findOne({ username: data.username }).exec();
  if (isUsernameUsed && isUsernameUsed?.id !== user?.id) {
    return res.status(400).send({ message: "Username atau Email itu sudah ada yang pakai" });
  }
  try {
    const findUser = await UserModel.findById(user.id);
    findUser.username = data.username;
    findUser.email = data.email;
    findUser.full_name = data.full_name;
    await findUser.save();
    return res.status(200).send({ message: "Data berhasil disimpan" });
  } catch (error) {
    console.log(error);
    return res.status(400).send({ message: "Ada kesalahan di server" });
  }
}
// ubah kata sandi
async function changePassword(req, res) {
  const user = req.user;
  const findUser = await UserModel.findById(user.id).exec();
  // cek apakah sandi lama benar
  const data = req.body;
  const isPassCorrect = await bcrypt.compare(data.oldPass, findUser.password);
  if (!isPassCorrect) {
    return res.status(400).send({ message: "Kata sandi lama salah" });
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(data.newPass, salt);
    findUser.password = hashedPass;
    await findUser.save();
    return res.status(200).send({ message: "Kata sandi berhasil diubah" });
  } catch (error) {
    console.log(error);
  }
}

// Ambil link menuju foto profil
async function getImage(req, res) {
  const user = req?.user;
  if (!user) {
    return res.status(401).send({ message: "Kamu tidak punya akses ke sini" });
  }
  const image = user?.image;
  if (!image) {
    return res.status(204);
  }
  const findUser = await UserModel.findById(user.id).exec();
  if (!findUser) {
    return res.status(204);
  }
  try {
    return res.status(200).send(`http://localhost:8000/${findUser?.image}`);
  } catch (error) {
    console.log(error);
  }
}
// Update foto profil
async function updateImg(req, res) {
  const file = req.file?.path;
  const user = req.user;
  const findUser = await UserModel.findById(user.id).exec();
  if (!file) {
    return res.status(400).send({ message: "Tidak ada gambar yang diunggah" });
  }
  if (!findUser) {
    return res.status(204);
  }
  let oldPicture = findUser?.image;
  // Kalau oldPicture ada, hapus dulu gambar lama
  if (oldPicture) {
    oldPicture = path.join(__dirname, `../${oldPicture}`);
    fs.unlink(oldPicture, (err) => console.log(err));
    try {
      findUser.image = file;
      await findUser.save();
      return res.status(200).send({ message: "Gambar berhasil disimpan" });
    } catch (error) {
      return res.status(400).send({ message: "Ada kesalahan di server" });
    }
  } else {
    try {
      findUser.image = file;
      await findUser.save();
      return res.status(200).send({ message: "Gambar berhasil disimpan" });
    } catch (error) {
      return res.status(400).send({ message: "Ada kesalahan di server" });
    }
  }
}
module.exports = { register, login, logout, refresh, getUser, editUser, updateImg, getImage, changePassword };
