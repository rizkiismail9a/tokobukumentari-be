const allowedOrigin = ["http://localhost:5173", "https://tokobukumentari.netlify.app"];
const corsOption = {
  origin: (origin, callback) => {
    if (allowedOrigin.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Kamu tidak punya akses ke sini, kata cors"));
    }
  },
};

module.exports = corsOption;
