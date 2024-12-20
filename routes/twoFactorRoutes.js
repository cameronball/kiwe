const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const User = require('../schemas/UserSchema');
const speakeasy = require("speakeasy");

// Set the view engine to pug
app.set("view engine", "pug");
// Set the views directory
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

// Route to render the two-factor authentication page
router.get("/", (req, res, next) => {
    // If no session or user is found, redirect to the login page
  if  (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

    // If two-factor authentication is already verified, redirect to the home page
  if (req.session.user.twoFactorVerified) {
    return res.redirect('/home');
  }
  
    // Create a payload object
  var payload = req.body;
    // Set the page title to Two Factor Auth
  payload.pageTitle = "Two Factor Auth";
    // Add the user to the payload
  payload.userLoggedIn = req.session.user;
    // Render the two-factor authentication page with the payload
  res.status(200).render("twoFactor", payload);
})

// Route to render the two-factor authentication setup page
router.get("/setup", (req, res, next) => {
    // If a session and user are found
  if (req.session && req.session.user) {
        // If the user is banned, redirect to the banned page
    if (req.session.user.banned) {
      return res.redirect('/banned');
    }
        // If two-factor authentication is enabled and not verified, redirect to the two-factor authentication page
    else if (req.session.user.twoFactorEnabled && !req.session.user.twoFactorVerified) {
      return res.redirect('/twofactor');
    }
        // If two-factor authentication is not enabled or verified, render the two-factor authentication settings page
    else {
            // Create a payload object
      var payload = req.body;
            // Set the page title to 2FA Setup
      payload.pageTitle = "2FA Setup";
            // Set the two factor setup status
      payload.twoFactorSetup = req.session.user.twoFactorEnabled;
            // Add the user to the payload
      payload.userLoggedIn = req.session.user;
            // Render the two-factor authentication settings page with the payload
      res.status(200).render("twoFactorSettings", payload);
    }
  }
    // If no session or user is found, redirect to the login page
  else {
    return res.redirect('/login');
  }
})

// Route to handle the two-factor authentication form submission
router.post("/", async (req, res, next) => {
    // Create a payload object
  var payload = req.body;
    // Set the page title to Two Factor Auth
  payload.pageTitle = "Two Factor Auth";
    // Add the user to the payload
  payload.userLoggedIn = req.session.user;

    // If no session or user is found, redirect to the login page
  if  (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

    // If two-factor authentication is already verified, redirect to the home page
  if (req.session.user.twoFactorVerified) {
    return res.redirect('/home');
  }
  
    // Get the two-factor code from the request body and trim any whitespace
  givenCode=req.body.twoFactorCode.trim();

    // Find the user with the given username or email
  var user = await User.findOne({
      $or: [
        { username: req.session.user.username },
        { email: req.session.user.email }
      ]
    })
    .catch((error) => {
        // Log any errors
      console.log(error);
        // Set the error message and render the two-factor authentication page
      payload.errorMessage = "Something went wrong.";
      res.status(200).render("twoFactor", payload);
    })

    // If a user is found
   if (user != null) {
        // If no two-factor secret is found, set the error message and render the two-factor authentication page
      if (user.twoFactorSecret == null) {
        payload.errorMessage = "Something went wrong.";
        res.status(200).render("twoFactor", payload);
      }
        // Verify the two-factor code
      var verified = speakeasy.totp.verify({ secret: user.twoFactorSecret,
                                       encoding: 'base32',
                                       token: givenCode });
        // If the code is valid
      if (verified) {
            // Set two-factor authentication to verified in the session
        req.session.user.twoFactorVerified = true;
            // Redirect to the home page
        return res.redirect('/home');
      }
        // If the code is not valid, set the error message and render the two-factor authentication page
      else {
        payload.errorMessage = "Incorrect code.";
        res.status(200).render("twoFactor", payload);
      }
    }

    // If no user is found, render the two-factor authentication page with the payload
  res.status(200).render("twoFactor", payload);
})

// Export the router
module.exports = router;
