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

  if  (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

  if (req.session.user.twoFactorVerified) {
    return res.redirect('/home');
  }
  
  var payload = req.body;
  payload.pageTitle = "Two Factor Auth";
  res.status(200).render("twoFactor", payload);
})

router.get("/setup", (req, res, next) => {

  if (req.session && req.session.user) {
    if (req.session.user.banned) {
      return res.redirect('/banned');
    }
    else if (req.session.user.twoFactorEnabled && !req.session.user.twoFactorVerified) {
      return res.redirect('/twofactor');
    }
    else {
      var payload = req.body;
      payload.pageTitle = "2FA Setup";
      payload.twoFactorSetup = req.session.user.twoFactorEnabled;
      res.status(200).render("twoFactorSettings", payload);
    }
  }
  else {
    return res.redirect('/login');
  }
})

router.post("/", async (req, res, next) => {
  var payload = req.body;
  payload.pageTitle = "Two Factor Auth";

  if  (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

  if (req.session.user.twoFactorVerified) {
    return res.redirect('/home');
  }
  
  givenCode=req.body.twoFactorCode.trim();

  var user = await User.findOne({
      $or: [
        { username: req.session.user.username },
        { email: req.session.user.email }
      ]
    })
    .catch((error) => {
      console.log(error);
      payload.errorMessage = "Something went wrong.";
      res.status(200).render("twoFactor", payload);
    })

   if (user != null) {
      if (user.twoFactorSecret == null) {
        payload.errorMessage = "Something went wrong.";
        res.status(200).render("twoFactor", payload);
      }
      var verified = speakeasy.totp.verify({ secret: user.twoFactorSecret,
                                       encoding: 'base32',
                                       token: givenCode });
      if (verified) {
        req.session.user.twoFactorVerified = true;
        return res.redirect('/home');
      }
      else {
        payload.errorMessage = "Incorrect code.";
        res.status(200).render("twoFactor", payload);
      }
    }

  res.status(200).render("twoFactor", payload);
})

module.exports = router;
