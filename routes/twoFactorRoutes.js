const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const User = require('../schemas/UserSchema');


app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  var payload = req.body;
  payload.pageTitle = "Two Factor Auth";
  res.status(200).render("twofactor", payload);
})

router.post("/", async (req, res, next) => {

  var payload = req.body;
  payload.pageTitle = "Two Factor Auth";

  username=req.body.logUsername.trim().toLowerCase();
  password=req.body.logPassword.trim();

  if (username && password) {
    var user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    })
    .catch((error) => {
      console.log(error);
      payload.errorMessage = "Something went wrong.";
      res.status(200).render("twofactor", payload);
    })

    if (user != null) {
      var result = await bcrypt.compare(req.body.logPassword, user.password);

      if (result === true) {
        req.session.user = user;
        req.session.user.twoFactorVerified = false;
        return res.redirect("/");
      }
      
    }

    payload.errorMessage = "Login credentials incorrect.";
    return res.status(200).render("twofactor", payload);
  }

  payload.errorMessage = "Make sure each field has a valid value.";
  res.status(200).render("twofactor", payload);
})

module.exports = router;
