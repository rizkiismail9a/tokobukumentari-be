const allowedOrigin = ["http://localhost:5173", "https://tokobukumentari.netlify.app/"];

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  console.log(origin);
  if (allowedOrigin.includes(origin)) {
    res.header("Access-Control-Allow-Origin", true);
    res.header("Access-Control-Allow-Credentials", true);
  }
  next();
};

module.exports = credentials;
