const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt');
var validator = require("email-validator");
const User = require('../schemas/UserSchema');

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  var payload = req.body;
  payload.pageTitle = "Register";
  res.status(200).render("register", payload);
})

router.post("/", async (req, res, next) => {

  var firstName = req.body.firstName.trim();
  var lastName = req.body.lastName.trim();
  var username = req.body.username.trim();
  var email = req.body.email.trim();
  var password = req.body.password;
  var secretCode = req.body.secretCode.trim();

  var payload = req.body;
  payload.pageTitle = "Register";

  if (firstName && username && email && password) {
    firstName=firstName.replace(/[^\w\s]/gi, '');
    lastName=lastName.replace(/[^\w\s]/gi, '');
    username = username.replace(/[^\w\s]/gi, '');
    email=email.replace(/[&\/\\#, ()$~%'":*?<>{}]/g, '');
    username=username.toLowerCase();
    email=email.toLowerCase();

    // Update the payload with sanitized data
    payload.firstName = firstName;
    payload.lastName = lastName;
    payload.username = username;
    payload.email = email;
    
    var user = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    })
    .catch((error) => {
      console.log(error);
      payload.errorMessage = "Something went wrong.";
      res.status(200).render("register", payload);
    });

    if (user == null) {
      // No user found

      var data = payload;

      data.password = await bcrypt.hash(password, 10);
      data.following = ['65302a9670ee1780e3593113', '65392a74ee7e23fb0db658f8'];

      if (secretCode == process.env.CODE) {
        User.create(data)
        .then((user) => {
            req.session.user = user;
            req.session.user.twoFactorVerified = false;
            return res.redirect("/");
        })
      }
      else {
        payload.errorMessage = "Invalid signup code.";
        res.status(200).render("register", payload);
      }
      
    }
    else {
      // User found
      if (email == user.email) {
        payload.errorMessage = "Email already in use.";
      }
      if (validator.validate(email) == false) {
        payload.errorMessage = "Please enter a valid email.";
      }
      else {
        payload.errorMessage = "Username already taken.";
      }
      res.status(200).render("register", payload);
    }
    
  }
  else {
    payload.errorMessage = "Please fill all the fields.";
    res.status(200).render("register", payload);
  }
  
})

module.exports = router;
