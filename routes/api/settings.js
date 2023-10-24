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
var validator = require("email-validator");

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
			
			req.session.user = updatedUser;

			return res.sendStatus(200);
			} catch (error) {
			console.error(error);
			return res.sendStatus(500);
			}
		}
});

router.put("/username", async (req, res, next) => {
	var username = req.body.username.replace(/[^\w\s]/gi, '');
	username=username.toLowerCase();

	if (!req.body.username) {
		return res.sendStatus(400);
	}

	var user = await User.findOne({
		username: username
	});

	if (user != null) {
		return res.sendStatus(409);
	}

	var newUser = await User.findByIdAndUpdate(req.session.user._id, { username: username }, { new: true });

	req.session.user = newUser;

	return res.sendStatus(200);
});

router.put("/email", async (req, res, next) => {
	var email = req.body.email.trim();
	email=email.toLowerCase();

	if (!req.body.email) {
		return res.sendStatus(400);
	}

	if (validator.validate(email) == false) {
		return res.sendStatus(406);
	}

	var user = await User.findOne({
		email: email
	});

	if (user != null) {
		return res.sendStatus(409);
	}

	var newUser = await User.findByIdAndUpdate(req.session.user._id, { email: email }, { new: true });

	req.session.user = newUser;

	return res.sendStatus(200);
});

module.exports = router;