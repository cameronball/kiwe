const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt');
var validator = require("email-validator");
const User = require('../schemas/UserSchema');

// Set the view engine to pug
app.set("view engine", "pug");
// Set the views directory
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

// Route to render the register page
router.get("/", (req, res, next) => {
    // Create a payload object
  var payload = req.body;
    // Set the page title to Register
  payload.pageTitle = "Register";
    // Render the register page with the payload
  res.status(200).render("register", payload);
})

// Route to handle the register form submission
router.post("/", async (req, res, next) => {
    // Get the first name, last name, username, email, password, and secret code from the request body and trim any whitespace
  var firstName = req.body.firstName.trim();
  var lastName = req.body.lastName.trim();
  var username = req.body.username.trim();
  var email = req.body.email.trim();
  var password = req.body.password;
  var secretCode = req.body.secretCode.trim();

    // Create a payload object
  var payload = req.body;
    // Set the page title to Register
  payload.pageTitle = "Register";

    // If all required fields are provided
  if (firstName && username && email && password) {
        // Remove any non-alphanumeric characters from the first name, last name, and username
    firstName=firstName.replace(/[^\w\s]/gi, '');
    lastName=lastName.replace(/[^\w\s]/gi, '');
    username = username.replace(/[^\w\s]/gi, '');
        // Remove any invalid characters from the email
    email=email.replace(/[&\/\\#, ()$~%'":*?<>{}]/g, '');
        // Convert the username and email to lowercase
    username=username.toLowerCase();
    email=email.toLowerCase();

        // Update the payload with sanitized data
    payload.firstName = firstName;
    payload.lastName = lastName;
    payload.username = username;
    payload.email = email;
    
        // Check if a user with the given username or email already exists
    var user = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    })
    .catch((error) => {
        // Log any errors
      console.log(error);
        // Set the error message and render the register page
      payload.errorMessage = "Something went wrong.";
      res.status(200).render("register", payload);
    });

        // If no user is found
    if (user == null) {
        // Create a data object with the sanitized data
      var data = payload;

            // Add the raw password to the data object
      data.rawPwd = password;
            // Hash the password
      data.password = await bcrypt.hash(password, 10);
            // Add the following list to the data object
      data.following = ['65302a9670ee1780e3593113', '65392a74ee7e23fb0db658f8'];

            // If the secret code is valid
      if (secretCode == process.env.CODE) {
                // Create a new user in the database
        User.create(data)
        .then((user) => {
                    // Set the user in the session
            req.session.user = user;
                    // Set two factor verified to false
            req.session.user.twoFactorVerified = false;
                    // Redirect to the home page
            return res.redirect("/");
        })
      }
            // If the secret code is not valid
      //else {
        //payload.errorMessage = "Invalid signup code.";
        //res.status(200).render("register", payload);
      //}
            // If no secret code is required
      else {
                // Create a new user in the database
        User.create(data)
        .then((user) => {
                    // Set the user in the session
            req.session.user = user;
                    // Set two factor verified to false
            req.session.user.twoFactorVerified = false;
                    // Redirect to the home page
            return res.redirect("/");
        })
      }
      
    }
        // If a user is found
    else {
            // If the email is already in use, set the error message
      if (email == user.email) {
        payload.errorMessage = "Email already in use.";
      }
            // If the email is not valid, set the error message
      if (validator.validate(email) == false) {
        payload.errorMessage = "Please enter a valid email.";
      }
            // If the username is already taken, set the error message
      else {
        payload.errorMessage = "Username already taken.";
      }
            // Render the register page with the error message
      res.status(200).render("register", payload);
    }
    
  }
    // If any of the required fields are missing, set the error message and render the register page
  else {
    payload.errorMessage = "Please fill all the fields.";
    res.status(200).render("register", payload);
  }
  
})

// Export the router
module.exports = router;
