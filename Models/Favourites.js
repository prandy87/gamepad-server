const mongoose = require("mongoose");

const Favourite = mongoose.model("Favourite", {
  userId: String,
  GameId: String,
});
