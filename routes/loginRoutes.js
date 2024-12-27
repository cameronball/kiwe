const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const User = require('../schemas/UserSchema');

// Set the view engine to pug
app.set("view engine", "pug");
// Set the views directory
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

// Route to render the login page
router.get("/", (req, res, next) => {
    // Create a payload object
  var payload = req.body;
  // Set the page title to Login
  payload.pageTitle = "Login";
  // Render the login page with the payload
  res.status(200).render("login", payload);
})

// Route to handle the login form submission
router.post("/", async (req, res, next) => {
    // Create a payload object
  var payload = req.body;
  // Set the page title to Login
  payload.pageTitle = "Login";

    // Get the username and password from the request body and trim any whitespace
  username=req.body.logUsername.trim().toLowerCase();
  password=req.body.logPassword.trim();

    // If both username and password are provided
  if (username && password) {
        // Find the user with the given username or email
    var user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    })
    .catch((error) => {
        // Log any errors
      console.log(error);
        // Set the error message and render the login page
      payload.errorMessage = "Something went wrong.";
      res.status(200).render("login", payload);
    })

        // If a user is found
    if (user != null) {
        // Compare the provided password with the hashed password in the database
      var result = await bcrypt.compare(req.body.logPassword, user.password);

            // If the passwords match
      if (result === true) {
                // Set the user in the session
        req.session.user = user;
                // Set the two factor verified to false
        req.session.user.twoFactorVerified = false;
                // If two factor authentication is enabled, redirect to the two factor page
        if(req.session.user.twoFactorEnabled) {
          return res.redirect("/twofactor");
        }
                // If two factor authentication is not enabled, redirect to the home page
        else {
          return res.redirect("/");
        }
      }
      
    }

        // If the login credentials are incorrect, set the error message and render the login page
    payload.errorMessage = "Login credentials incorrect.";
    return res.status(200).render("login", payload);
  }

    // If the username or password are not provided, set the error message and render the login page
  payload.errorMessage = "Make sure each field has a valid value.";
  res.status(200).render("login", payload);
})

// Export the router
module.exports = router;
