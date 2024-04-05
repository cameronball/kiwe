const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const sanitizer = require('sanitizer');
const bcrypt = require('bcrypt');

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');
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

router.put("/bio", async (req, res, next) => {
	var bio = req.body.bio.trim();
	//bio = bio.replace(/[^\w\s.]/gi, '');
	bio = sanitizer.escape(bio);

	var newUser = await User.findByIdAndUpdate(req.session.user._id, { bio: bio }, { new: true });

	req.session.user = newUser;

	return res.sendStatus(200);
});

router.put("/password", async (req, res, next) => {
	var oldPassword = req.body.oldPassword;
	var newPassword = req.body.newPassword;
	var confirmPassword = req.body.confirmPassword;
	var id = req.session.user._id;

	if (!oldPassword || !newPassword || !confirmPassword) {
		return res.sendStatus(400);
	}

	if (newPassword != confirmPassword) {
		return res.sendStatus(409);
	}

	var hashedNewPassword = await bcrypt.hash(newPassword, 10);

	// Check current password
	var user = await User.findOne({
		_id: id
	});

	if (user == null) {
		return res.sendStatus(404);
	}
	else {
		var result = await bcrypt.compare(oldPassword, user.password);

		if (result == false) {
			return res.sendStatus(401);
		}
	}

	var newUser = await User.findByIdAndUpdate(req.session.user._id, { password: hashedNewPassword }, { new: true });

	req.session.user = newUser;

	return res.sendStatus(200);
});

router.delete("/delete", async (req, res, next) => {
	var id = req.session.user._id;
	var password = req.body.password;

	if (!password) {
		return res.sendStatus(400);
	}

	// Check current password
	var user = await User.findOne({
		_id: id
	});

	if (user == null) {
		return res.sendStatus(404);
	}
	else {
		var result = await bcrypt.compare(password, user.password);

		if (result == false) {
			return res.sendStatus(401);
		}
	}

	// Delete notifications
	await Notification.deleteMany({ "userTo": id });
	await Notification.deleteMany({ "userFrom": id });

	// Remove user from any chats that they are in, there is an array in each chat document that contains the ids of the users in the chat
	await Chat.updateMany(
		{ "users": { $elemMatch: { $eq: id } } },
		{ $pull: { "users": id } }
	);

	// Delete messages
	await Message.deleteMany({ "sender": id });


	// Delete posts
	await Post.deleteMany({ "postedBy": id });

	// Delete user
	await User.findByIdAndDelete(id);

	req.session.destroy((err) => {
		if (err) {
			console.log(err);
		}
		else {
			res.clearCookie("connect.sid");
			return res.sendStatus(200);
		}
	});
});

module.exports = router;
