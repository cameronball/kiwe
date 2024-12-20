const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');
const Notification = require('../../schemas/NotificationSchema');

var validator = require("email-validator");

app.use(bodyParser.urlencoded({ extended: false }));

// Route to get a user's verification status
router.get("/verifySearch", async (req, res, next) => {
	// If no username is provided in the query, return a 400 error
	if(!req.query.username) {
		return res.sendStatus(400);	
	}

	// Get the username from the query
	var username = req.query.username;

	// Find the user with the given username
	var user = await User.findOne({ username: username });

	// If no user is found, return a 404 error
	if (user==null) {
		return res.sendStatus(404);
	}
	else {
		// Return 200 and the user data
		return res.status(200).send(user);
	}
});

// Route to update a user's verification status
router.put("/verify", async (req, res, next) => {
	// Get the username, type, and action from the request body
	var username = req.body.username;
	var type = req.body.type;
	var action = req.body.action;

	// Find the user with the given username
	var user = await User.findOne({ username: username });
	// Get the user's ID
	var id = user._id;

	// If any of the required fields are missing, return a 400 error
	if (!username || !type || !action) {
		return res.sendStatus(400);
	}

	// Switch statement to handle different types of verification
	switch (type) {
		// If the type is user
		case "user":
			// If the action is verify
			if(action=="verify") {
				// Update the user's verified status to true
				var update = await User.findByIdAndUpdate(
					id,
					{ verified: true },
					{ new: true }
				);
			}
			// If the action is unverify
			else if(action=="unverify") {
				// Update the user's verified status to false
				var update = await User.findByIdAndUpdate(
					id,
					{ verified: false },
					{ new: true }
				);
			}
			// If the action is not valid, return a 400 error
			else {
				return res.sendStatus(400);
			}
			break;
		// If the type is brand
		case "brand":
			// If the action is verify
			if(action=="verify") {
				// Update the user's verified brand status to true
				var update = await User.findByIdAndUpdate(
					id,
					{ verifiedBrand: true },
					{ new: true }
				);
			}
			// If the action is unverify
			else if(action=="unverify") {
				// Update the user's verified brand status to false
				var update = await User.findByIdAndUpdate(
					id,
					{ verifiedBrand: false },
					{ new: true }
				);
			}
			// If the action is not valid, return a 400 error
			else {
				return res.sendStatus(400);
			}
			break;
		// If the type is admin
		case "admin":
			// If the action is make
			if(action=="make") {
				// Update the user's admin status to true
				var update = await User.findByIdAndUpdate(
					id,
					{ admin: true },
					{ new: true }
				);
			}
			// If the action is remove
			else if(action=="remove") {
				// Update the user's admin status to false
				var update = await User.findByIdAndUpdate(
					id,
					{ admin: false },
					{ new: true }
				);
			}
			// If the action is not valid, return a 400 error
			else {
				return res.sendStatus(400);
			}
			break;
		// If the type is government
		case "government":
			// If the action is verify
			if(action=="verify") {
				// Update the user's verified government status to true
				var update = await User.findByIdAndUpdate(
					id,
					{ verifiedGovernment: true },
					{ new: true }
				);
			}
			// If the action is unverify
			else if(action=="unverify") {
				// Update the user's verified government status to false
				var update = await User.findByIdAndUpdate(
					id,
					{ verifiedGovernment: false },
					{ new: true }
				);
			}
			// If the action is not valid, return a 400 error
			else {
				return res.sendStatus(400);
			}
			break;
		// If the type is not valid, return a 400 error
		default:
			return res.sendStatus(400);
	}

	// If the update failed, return a 500 error
	if (update == null) {
		return res.sendStatus(500);
	}
	else {
		// If the update was successful, return a 200 status
		return res.sendStatus(200);
	}
});

// Route to get a user's ban status
router.get("/banSearch", async (req, res, next) => {
	// If no username is provided in the query, return a 400 error
	if(!req.query.username) {
		return res.sendStatus(400);	
	}

	// Get the username from the query
	var username = req.query.username;

	// Find the user with the given username
	var user = await User.findOne({ username: username });

	// If no user is found, return a 404 error
	if (user==null) {
		return res.sendStatus(404);
	}
	else {
		// Return 200 and the user data
		return res.status(200).send(user);
	}
});

// Route to update a user's ban status
router.put("/ban", async (req, res, next) => {
	// Get the username, type, and action from the request body
	var username = req.body.username;
	var type = req.body.type;
	var action = req.body.action;

	// Find the user with the given username
	var user = await User.findOne({ username: username });
	// Get the user's ID
	var id = user._id;

	// If any of the required fields are missing, return a 400 error
	if (!username || !type || !action) {
		return res.sendStatus(400);
	}

	// Switch statement to handle different types of ban
	switch (type) {
		// If the type is ban
		case "ban":
			// If the action is ban
			if(action=="ban") {
				// Update the user's banned status to true
				var update = await User.findByIdAndUpdate(
					id,
					{ banned: true },
					{ new: true }
				);
			}
			// If the action is unban
			else if(action=="unban") {
				// Update the user's banned status to false
				var update = await User.findByIdAndUpdate(
					id,
					{ banned: false },
					{ new: true }
				);
			}
			// If the action is not valid, return a 400 error
			else {
				return res.sendStatus(400);
			}
			break;
		// If the type is not valid, return a 400 error
		default:
			return res.sendStatus(400);
	}

	// If the update failed, return a 500 error
	if (update == null) {
		return res.sendStatus(500);
	}
	else {
		// If the update was successful, return a 200 status
		return res.sendStatus(200);
	}
});

// Route to get a post's like data
router.get("/addLikeSearch", async (req, res, next) => {
	// If no ID is provided in the query, return a 400 error
	if(!req.query.id) {
		return res.sendStatus(400);	
	}

	// Get the ID from the query
	var id = req.query.id;

	// Find the post with the given ID
	try {
		var post = await Post.findById(id);
	}
	catch {
		// If the ID is invalid, return a 400 error
		return res.sendStatus(400);
	}

	// If no post is found, return a 404 error
	if (post==null) {
		return res.sendStatus(404);
	}
	else {
		// Return 200 and the post data
		return res.status(200).send(post);
	}
});

// Route to add likes to a post
router.put("/addLike", async (req, res, next) => {
	// If no ID or number is provided in the body, return a 400 error
	if(!req.body.id || !req.body.number) {
		return res.sendStatus(400);	
	}

	// Get the ID and number from the body
	var id = req.body.id;
	var number = req.body.number;

	// Loop through the number of likes to add
	for(var i=0; i<number; i++) {
		// Generate random mongoDB id
		var newId = mongoose.Types.ObjectId();

		// Update the post with the new like
		var update = await Post.findByIdAndUpdate(
			id,
			{ $push: { likes: newId } },
			{ new: true }
		);

		// If the update failed, return a 500 error
		if (update == null) {
			return res.sendStatus(500);
		}
	}

	// If the update was successful, return a 200 status and the updated post
	return res.status(200).send(update);
});

// Route to get a post's boost data
router.get("/addBoostSearch", async (req, res, next) => {
    // If no ID is provided in the query, return a 400 error
	if(!req.query.id) {
		return res.sendStatus(400);	
	}

	// Get the ID from the query
	var id = req.query.id;

    // Find the post with the given ID
	try {
		var post = await Post.findById(id);
	}
	catch {
		// If the ID is invalid, return a 400 error
		return res.sendStatus(400);
	}

    // If no post is found, return a 404 error
	if (post==null) {
		return res.sendStatus(404);
	}
	else {
		// Return 200 and the post data
		return res.status(200).send(post);
	}
});

// Route to update a post's boost status
router.put("/addBoost", async (req, res, next) => {
    // If no ID is provided in the body, return a 400 error
	if(!req.body.id) {
		return res.sendStatus(400);	
	}

	// Get the ID from the body
	var id = req.body.id;

	// Flip the status of the post boost (true to false, false to true)
	var update = await Post.findOneAndUpdate(
		{ _id: id },
		[
			{ $set: { boosted: { $not: "$boosted" } } } // Using aggregation to flip the boolean
		],
		{ new: true } // Return the updated document
	);

	// If the update failed, return a 500 error
	if (update == null) {
		return res.sendStatus(500);
	}

	// If the update was successful, return a 200 status and the updated post
	return res.status(200).send(update);
});

// Route to get the stats for the app
router.get("/stats", async (req, res, next) => {
	// Get the number of users
	var getUserCount = await User.count({});
	// Get the number of posts
	var getPostCount = await Post.count({});
	// Get the number of messages
	var getMessageCount = await Message.count({});

	// Create an object with the counts
	var counts = {
	    getUserCount,
	    getPostCount,
	    getMessageCount,
	  };

	// Return 200 and the counts
	return res.status(200).send(counts);
});

// Export the router
module.exports = router;
