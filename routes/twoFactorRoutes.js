const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const User = require('../schemas/UserSchema');
const speakeasy = require("speakeasy");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  var payload = req.body;
  payload.pageTitle = "Two Factor Auth";
  res.status(200).render("twoFactor", payload);
})

router.post("/", async (req, res, next) => {
  //-TODO
  console.log("pass");
})

module.exports = router;
