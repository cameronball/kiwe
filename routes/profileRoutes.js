const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const User = require('../schemas/UserSchema');

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res, next) => {

	var payload = {
		pageTitle: "@"+req.session.user.username,
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
		profileUser: req.session.user
	}
  
  	res.status(200).render("profilePage", payload);
})

module.exports = router;