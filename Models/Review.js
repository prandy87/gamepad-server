const mongoose = require("mongoose");

const Review = mongoose.model("Review", {
  username: {
    type: String,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
  avatar: String,
  GameId: {
    type: String,
    required: true,
  },
  likes: Number,
  dislikes: Number,
});

module.exports = Review;
