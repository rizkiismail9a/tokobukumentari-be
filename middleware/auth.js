function auth(req, res, next) {
  if (req.user?.id) {
    return next();
  }
  return res.status(401).send({ message: "Kamu tidak punya akses ke sini, kata auth" });
}

module.exports = auth;
