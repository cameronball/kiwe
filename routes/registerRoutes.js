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
  payload.pageTitle = "Register";
  res.status(200).render("register", payload);
})

router.post("/", async (req, res, next) => {

  var firstName = req.body.firstName.trim();
  var lastName = req.body.lastName.trim();
  var username = req.body.username.trim();
  var email = req.body.email.trim();
  var password = req.body.password;

  var payload = req.body;
  payload.pageTitle = "Register";

  if (firstName && lastName && username && email && password) {
    firstName=firstName.replace(/[&\/\\#, +()$~%'":*?<>{}]/g, '');
    lastName=lastName.replace(/[&\/\\#, +()$~%'":*?<>{}]/g, '');
    username=username.replace(/[&\/\\#, +()$~%'":*?<>{}]/g, '');
    email=email.replace(/[&\/\\#, ()$~%'":*?<>{}]/g, '');
    username=username.toLowerCase();
    email=email.toLowerCase();
    
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

      var data = req.body;

      data.password = await bcrypt.hash(password, 10);

      User.create(data)
      .then((user) => {
          req.session.user = user;
          return res.redirect("/");
      })
    }
    else {
      // User found
      if (email == user.email) {
        payload.errorMessage = "Email already in use.";
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