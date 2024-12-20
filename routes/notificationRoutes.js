const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const mongoose = require("mongoose");
const User = require('../schemas/UserSchema');
const Chat = require('../schemas/ChatSchema');

// Set the view engine to pug
app.set("view engine", "pug");
// Set the views directory
app.set("views", "views");

// Route to render the notifications page
router.get("/", (req, res, next) => {
    // Create a payload object
	var payload = {
		pageTitle: "Notifications",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user)
	};
	
    // Render the notifications page with the payload
  	res.status(200).render("notificationsPage", payload);
})

// Export the router
module.exports = router;
