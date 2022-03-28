require("dotenv").config();

const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const axios = require("axios");

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const app = express();
app.use(formidable());
app.use(cors());

const User = require("./Models/User");
const Review = require("./Models/Review");

const url = process.env.GAME_PAD_URL;
const apiKey = process.env.GAME_PAD_API_KEY;

app.get("/", (req, res) => {
  res.status(200).json("Welcome to GamePad Pascal");
});

app.get("/games", async (req, res) => {
  const limit = 20;
  const page = req.query.page;
  const skip = (page - 1) * limit;
  platforms = req.query.platforms;
  genres = req.query.genres;

  if (req.query.platforms && req.query.genres) {
    try {
      console.log(req.query);
      const response = await axios.get(
        `${url}/games?key=${apiKey}&platforms=${req.query.platforms}&genres=${req.query.genres}&page=${req.query.page}&search=${req.query.search}`
      );
      res.json(response.data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.query.platforms) {
    try {
      console.log(req.query);
      const response = await axios.get(
        `${url}/games?key=${apiKey}&platforms=${req.query.platforms}&page=${req.query.page}&search=${req.query.search}`
      );
      res.json(response.data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else if (req.query.genres) {
    try {
      console.log(req.query);
      const response = await axios.get(
        `${url}/games?key=${apiKey}&page=${req.query.page}&search=${req.query.search}&genres=${req.query.genres}`
      );
      res.json(response.data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    try {
      console.log(req.query);
      const response = await axios.get(
        `${url}/games?key=${apiKey}&page=${req.query.page}&search=${req.query.search}`
      );
      res.json(response.data);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

app.get("/games/:GameId", async (req, res) => {
  const id = req.params.GameId;
  try {
    const response = await axios.get(`${url}/games/${id}?key=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/platforms", async (req, res) => {
  try {
    const response = await axios.get(`${url}/platforms?key=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/genres", async (req, res) => {
  try {
    const response = await axios.get(`${url}/genres?key=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/signup", async (req, res) => {
  console.log("bonjour");
  console.log(req.fields);
  try {
    if (req.fields.username && req.fields.password && req.fields.email) {
      const registeredEmail = await User.findOne({ email: req.fields.email });
      if (!registeredEmail) {
        try {
          const salt = uid2(16);
          const hash = SHA256(req.fields.password + salt).toString(encBase64);
          const token = uid2(16);

          const newUser = new User({
            email: req.fields.email,
            account: {
              username: req.fields.username,
            },
            token: token,
            hash: hash,
            salt: salt,
          });
          await newUser.save();
          res.status(200).json({
            _id: newUser._id,
            token: newUser.token,
            account: newUser.account,
          });
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      } else {
        res.status(400).json("Email is already registered.");
      }
    } else {
      res.json("Please fill in all sign up fields.");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  console.log(req.fields);
  if (req.fields.email && req.fields.password) {
    try {
      const findUser = await User.findOne({ email: req.fields.email });
      if (!findUser) {
        res.status(400).json("Invalid Email address.");
      } else {
        try {
          if (
            findUser.hash !==
            SHA256(req.fields.password + findUser.salt).toString(encBase64)
          ) {
            res.status(401).json("Invalid password.");
          } else {
            res.status(200).json({
              _id: findUser._id,
              token: findUser.token,
              account: findUser.account,
            });
          }
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.status(400).json("Please provide your username and password.");
  }
});

app.post("/favourites", async (req, res) => {
  console.log(req.fields);
  const findUser = await User.findOne({ token: req.fields.token });
  if (!findUser) {
    res.status(400).json("You are not registered.");
  } else {
    try {
      findUser.favourites.push(req.fields.GameID);
      await findUser.save();
      res.status(200).json("Succesfully added to your favourites!");
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found" });
});

app.listen(process.env.PORT, () => {
  console.log("GamePad server is up");
});
