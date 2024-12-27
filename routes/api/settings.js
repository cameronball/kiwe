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

// Route to update the user's name
router.put("/name", async (req, res, next) => {
    // Get the new first and last names from the request body and trim any whitespace
	var newFirstName = req.body.firstName.trim();
	var newLastName = req.body.lastName.trim();
	
    // Remove any non-alphanumeric characters from the first and last names
	newFirstName=newFirstName.replace(/[^\w\s]/gi, '');
	newLastName=newLastName.replace(/[^\w\s]/gi, '');

    // If the first name is empty, return a 400 error
	if (!newFirstName) {
		return res.sendStatus(400);
	} else {
        // Try to update the user's first and last names
		try {
            // Update the user's first name
			var firstNameUpdate = User.findByIdAndUpdate(
				req.session.user._id,
				{ firstName: newFirstName },
				{ new: true }
			);

            // Update the user's last name
			var lastNameUpdate = User.findByIdAndUpdate(
				req.session.user._id,
				{ lastName: newLastName },
				{ new: true }
			);

            // Wait for both updates to complete
			var [updatedUser, _] = await Promise.all([
				firstNameUpdate,
				lastNameUpdate,
			]);
			
            // Update the user in the session
			req.session.user = updatedUser;

            // Return a 200 status
			return res.sendStatus(200);
			} catch (error) {
            // Log any errors
			console.error(error);
            // Return a 500 error
			return res.sendStatus(500);
			}
		}
});

// Route to update the user's username
router.put("/username", async (req, res, next) => {
    // Get the username from the request body and remove any non-alphanumeric characters
	var username = req.body.username.replace(/[^\w\s]/gi, '');
    // Convert the username to lowercase
	username=username.toLowerCase();

    // If the username is empty, return a 400 error
	if (!req.body.username) {
		return res.sendStatus(400);
	}

    // Check if the username is already taken
	var user = await User.findOne({
		username: username
	});

    // If the username is already taken, return a 409 error
	if (user != null) {
		return res.sendStatus(409);
	}

    // Update the user's username
	var newUser = await User.findByIdAndUpdate(req.session.user._id, { username: username }, { new: true });

    // Update the user in the session
	req.session.user = newUser;

    // Return a 200 status
	return res.sendStatus(200);
});

// Route to update the user's email
router.put("/email", async (req, res, next) => {
    // Get the email from the request body and trim any whitespace
	var email = req.body.email.trim();
    // Convert the email to lowercase
	email=email.toLowerCase();

    // If the email is empty, return a 400 error
	if (!req.body.email) {
		return res.sendStatus(400);
	}

    // If the email is not valid, return a 406 error
	if (validator.validate(email) == false) {
		return res.sendStatus(406);
	}

    // Check if the email is already taken
	var user = await User.findOne({
		email: email
	});

    // If the email is already taken, return a 409 error
	if (user != null) {
		return res.sendStatus(409);
	}

    // Update the user's email
	var newUser = await User.findByIdAndUpdate(req.session.user._id, { email: email }, { new: true });

    // Update the user in the session
	req.session.user = newUser;

    // Return a 200 status
	return res.sendStatus(200);
});

// Route to update the user's bio
router.put("/bio", async (req, res, next) => {
    // Get the bio from the request body and trim any whitespace
	var bio = req.body.bio.trim();
    // Sanitize the bio
	bio = sanitizer.escape(bio);

    // Update the user's bio
	var newUser = await User.findByIdAndUpdate(req.session.user._id, { bio: bio }, { new: true });

    // Update the user in the session
	req.session.user = newUser;

    // Return a 200 status
	return res.sendStatus(200);
});

// Route to update the user's bio from the server
router.put("/bioServer", async (req, res, next) => {
    // Get the bio from the request body and trim any whitespace
	var bio = req.body.bio.trim();
    // Sanitize the bio
	bio = sanitizer.escape(bio);

    // Update the user's bio
	var newUser = await User.findByIdAndUpdate(req.body.user, { bio: bio }, { new: true });

    // Return the updated user
	return res.status(200).send({ newUser: newUser });
});

// Route to update the user's password
router.put("/password", async (req, res, next) => {
    // Get the old password, new password, and confirm password from the request body
	var oldPassword = req.body.oldPassword;
	var newPassword = req.body.newPassword;
	var confirmPassword = req.body.confirmPassword;
    // Get the user ID from the session
	var id = req.session.user._id;

    // If any of the passwords are empty, return a 400 error
	if (!oldPassword || !newPassword || !confirmPassword) {
		return res.sendStatus(400);
	}

    // If the new password and confirm password do not match, return a 409 error
	if (newPassword != confirmPassword) {
		return res.sendStatus(409);
	}

    // Hash the new password
	var hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Check the current password
	var user = await User.findOne({
		_id: id
	});

    // If no user is found, return a 404 error
	if (user == null) {
		return res.sendStatus(404);
	}
	else {
        // Compare the old password with the hashed password
		var result = await bcrypt.compare(oldPassword, user.password);

        // If the passwords do not match, return a 401 error
		if (result == false) {
			return res.sendStatus(401);
		}
	}

    // Update the user's password
	var newUser = await User.findByIdAndUpdate(req.session.user._id, { password: hashedNewPassword }, { new: true });

    // Update the user in the session
	req.session.user = newUser;

    // Return a 200 status
	return res.sendStatus(200);
});

// Route to delete the user's account
router.delete("/delete", async (req, res, next) => {
    // Get the user ID from the session
	var id = req.session.user._id;
    // Get the password from the request body
	var password = req.body.password;

    // If the password is empty, return a 400 error
	if (!password) {
		return res.sendStatus(400);
	}

    // Check the current password
	var user = await User.findOne({
		_id: id
	});

    // If no user is found, return a 404 error
	if (user == null) {
		return res.sendStatus(404);
	}
	else {
        // Compare the password with the hashed password
		var result = await bcrypt.compare(password, user.password);

        // If the passwords do not match, return a 401 error
		if (result == false) {
			return res.sendStatus(401);
		}
	}

    // Delete all notifications for the user
	await Notification.deleteMany({ "userTo": id });
	await Notification.deleteMany({ "userFrom": id });

    // Remove the user from any chats that they are in
	await Chat.updateMany(
		{ "users": { $elemMatch: { $eq: id } } },
		{ $pull: { "users": id } }
	);

    // Delete all messages sent by the user
	await Message.deleteMany({ "sender": id });

    // Delete all posts by the user
	await Post.deleteMany({ "postedBy": id });

    // Delete the user
	await User.findByIdAndDelete(id);

    // Destroy the session and clear the cookie
	req.session.destroy((err) => {
		if (err) {
            // Log any errors
			console.log(err);
		}
		else {
            // Clear the cookie and return a 200 status
			res.clearCookie("connect.sid");
			return res.sendStatus(200);
		}
	});
});

// Export the router
module.exports = router;
