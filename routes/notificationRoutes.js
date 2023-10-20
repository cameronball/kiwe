const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const mongoose = require("mongoose");
const User = require('../schemas/UserSchema');
const Chat = require('../schemas/ChatSchema');

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res, next) => {
	var payload = {
		pageTitle: "Notifications",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user)
	};
	
  	res.status(200).render("notificationsPage", payload);
})

module.exports = router;