const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserModel = Schema(
  {
    username: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    full_name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    refresh_token: String,
    cart: Array,
    wishlists: Array,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    virtuals: {
      id: {
        get() {
          return this._id;
        },
      },
    },
  }
);
module.exports = mongoose.model("users", UserModel);
