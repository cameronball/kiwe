const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.put("/name", async (req, res, next) => {
	var newFirstName = req.body.firstName.trim();
	var newLastName = req.body.lastName.trim();
	
	newFirstName=newFirstName.replace(/[^\w\s]/gi, '');
	newLastName=newLastName.replace(/[^\w\s]/gi, '');

	if (!newFirstName) {
		return res.sendStatus(400);
	} else {
		try {
		  var firstNameUpdate = User.findByIdAndUpdate(
			req.session.user._id,
			{ firstName: newFirstName },
			{ new: true }
		  );

		  var lastNameUpdate = User.findByIdAndUpdate(
			req.session.user._id,
			{ lastName: newLastName },
			{ new: true }
		  );

		  var [updatedUser, _] = await Promise.all([
			firstNameUpdate,
			lastNameUpdate,
		  ]);

		  return res.sendStatus(200);
		} catch (error) {
		  console.error(error);
		  return res.sendStatus(500);
		}
	  }
});

router.put("/username", async (req, res, next) => {
	username = req.body.username.replace(/[^\w\s]/gi, '');
	username=username.toLowerCase();

	if (!req.body.username) {
		console.log("Username not sent");
		return res.sendStatus(400);
	}

	// Check if username exists
	var user = await User.findOne({
		username: username
	});

	if (user != null) {
		console.log("Username already in use");
		return res.sendStatus(409);
	}

	var user = await User.findByIdAndUpdate(req.session.user._id, { username: username }, { new: true });

	return res.sendStatus(200);
});

module.exports = router;