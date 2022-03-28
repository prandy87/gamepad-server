const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  account: {
    username: String,
    avatar: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  token: String,
  hash: String,
  salt: String,
  favourites: Array,
});

module.exports = User;
