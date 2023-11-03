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

router.get("/verifySearch", async (req, res, next) => {
	// Get user's verification status
	
	if(!req.query.username) {
		return res.sendStatus(400);	
	}

	var username = req.query.username;

	var user = await User.findOne({ username: username });

	if (user==null) {
		return res.sendStatus(404);
	}
	else {
		// Return 200 and the user data
		return res.status(200).send(user);
	}
});

router.put("/verify", async (req, res, next) => {
	var username = req.body.username;
	var type = req.body.type;
	var action = req.body.action;

	var user = await User.findOne({ username: username });
	var id = user._id;

	if (!username || !type || !action) {
		return res.sendStatus(400);
	}

	switch (type) {
		case "user":
			if(action=="verify") {
				var update = await User.findByIdAndUpdate(
					id,
					{ verified: true },
					{ new: true }
				);
			}
			else if(action=="unverify") {
				var update = await User.findByIdAndUpdate(
					id,
					{ verified: false },
					{ new: true }
				);
			}
			else {
				return res.sendStatus(400);
			}
			break;
		case "brand":
			if(action=="verify") {
				var update = await User.findByIdAndUpdate(
					id,
					{ verifiedBrand: true },
					{ new: true }
				);
			}
			else if(action=="unverify") {
				var update = await User.findByIdAndUpdate(
					id,
					{ verifiedBrand: false },
					{ new: true }
				);
			}
			else {
				return res.sendStatus(400);
			}
			break;
		case "admin":
			if(action=="make") {
				var update = await User.findByIdAndUpdate(
					id,
					{ admin: true },
					{ new: true }
				);
			}
			else if(action=="remove") {
				var update = await User.findByIdAndUpdate(
					id,
					{ admin: false },
					{ new: true }
				);
			}
			else {
				return res.sendStatus(400);
			}
			break;
		case "government":
			if(action=="verify") {
				var update = await User.findByIdAndUpdate(
					id,
					{ verifiedGovernment: true },
					{ new: true }
				);
			}
			else if(action=="unverify") {
				var update = await User.findByIdAndUpdate(
					id,
					{ verifiedGovernment: false },
					{ new: true }
				);
			}
			else {
				return res.sendStatus(400);
			}
			break;
		default:
			return res.sendStatus(400);
	}

	if (update == null) {
		return res.sendStatus(500);
	}
	else {
		return res.sendStatus(200);
	}
});

router.get("/banSearch", async (req, res, next) => {
	// Get user's verification status
	
	if(!req.query.username) {
		return res.sendStatus(400);	
	}

	var username = req.query.username;

	var user = await User.findOne({ username: username });

	if (user==null) {
		return res.sendStatus(404);
	}
	else {
		// Return 200 and the user data
		return res.status(200).send(user);
	}
});

router.put("/ban", async (req, res, next) => {
	var username = req.body.username;
	var type = req.body.type;
	var action = req.body.action;

	var user = await User.findOne({ username: username });
	var id = user._id;

	if (!username || !type || !action) {
		return res.sendStatus(400);
	}

	switch (type) {
		case "ban":
			if(action=="ban") {
				var update = await User.findByIdAndUpdate(
					id,
					{ banned: true },
					{ new: true }
				);
			}
			else if(action=="unban") {
				var update = await User.findByIdAndUpdate(
					id,
					{ banned: false },
					{ new: true }
				);
			}
			else {
				return res.sendStatus(400);
			}
			break;
		default:
			return res.sendStatus(400);
	}

	if (update == null) {
		return res.sendStatus(500);
	}
	else {
		return res.sendStatus(200);
	}
});

router.get("/addLikeSearch", async (req, res, next) => {

	if(!req.query.id) {
		return res.sendStatus(400);	
	}

	var id = req.query.id;

	try {
		var post = await Post.findById(id);
	}
	catch {
		return res.sendStatus(400);
	}

	if (post==null) {
		return res.sendStatus(404);
	}
	else {
		return res.status(200).send(post);
	}
});

router.put("/addLike", async (req, res, next) => {
	if(!req.body.id || !req.body.number) {
		return res.sendStatus(400);	
	}

	var id = req.body.id;
	var number = req.body.number;

	for(var i=0; i<number; i++) {
		// Generate random mongoDB id
		var newId = mongoose.Types.ObjectId();

		var update = await Post.findByIdAndUpdate(
			id,
			{ $push: { likes: newId } },
			{ new: true }
		);

		if (update == null) {
			return res.sendStatus(500);
		}
	}

	return res.status(200).send(update);
});

router.get("/stats", async (req, res, next) => {
	var getUserCount = await User.count({});
	var getPostCount = await Post.count({});
	var getMessageCount = await Message.count({});

	var counts = {
	    getUserCount,
	    getPostCount,
	    getMessageCount,
	  };

	return res.status(200).send(counts);
});

module.exports = router;
