const mongoose = require("mongoose");

const Scheme = mongoose.Schema;
const Comments = Scheme(
  {
    content: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);
const BookModel = Scheme(
  {
    title: {
      type: String,
      required: true,
    },
    writer: {
      type: String,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    cetagory: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    about: {
      type: String,
      required: false,
    },
    file: {
      type: String,
      required: true,
    },
    comments: [Comments],
    bestSelling: Boolean,
  },
  {
    virtuals: {
      id: {
        get() {
          return this._id;
        },
      },
    },
  }
);

module.exports = mongoose.model("books", BookModel);
