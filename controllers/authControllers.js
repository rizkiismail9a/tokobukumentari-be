const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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
async function getUser(req, res) {
  const userProfile = req.user;
  return res.status(200).send(userProfile);
}
// route ini dijaga. Harus punya bearer authorization
async function editUser(req, res) {
  // cek apakah ada inputan yang masuk
  const data = req.body;
  if (!data.username || !data.email || !data.full_name) {
    return res.status(400).send({ message: "form isian tidak boleh kosong" });
  }
  // cek apakah user login atau tidak
  const cookies = req.cookies;
  if (!cookies.papoi) return res.sendStatus(401);
  // cek apakah user dengan token papoi itu ada
  const findUser = await UserModel.findOne({ refresh_token: cookies.papoi }, { password: 0, refresh_token: 0 }).exec();
  if (!findUser) {
    return res.sendStatus(401);
  }
  // cek apakah data yang dimasukkan sama dengan data lama
  if (data.username === findUser.username && data.email === findUser.email && data.full_name === findUser.full_name) {
    return res.status(400).send({ message: "Kamu belum mengubah apapun" });
  }
  // cek apakah username atau email baru dia pernah ada yang pakai
  const isEmailUsed = await UserModel.findOne({ email: data.email }).exec();
  const isUserNameUsed = await UserModel.findOne({ username: data.username });
  if (isEmailUsed || isUserNameUsed) return res.status(400).send({ message: "username atau email itu sudah dipakai" });
  try {
    findUser.username = data.username;
    findUser.email = data.email;
    findUser.full_name = data.full_name;
    await findUser.save();
    return res.status(200).send({ message: "Data berhasil disimpan" });
  } catch (error) {
    return res.send(error);
  }
}
module.exports = { register, login, logout, refresh, getUser, editUser };
