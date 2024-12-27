const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const sanitizer = require('sanitizer');
const mongoose = require("../../database");
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');

app.use(bodyParser.urlencoded({ extended: false }));

// Route to create a new chat
router.post("/", async (req, res, next) => {
	// If no users are provided in the body, return a 400 error
	if(!req.body.users) {
		console.log("Users param not sent with request");
		return res.sendStatus(400);
	}

	// Get the users from the body and parse them from JSON
	var users = JSON.parse(req.body.users);

	// If the users array is empty, return a 400 error
	if(users.length == 0) {
		console.log("Users array is empty");
		return res.sendStatus(400);
	}

	// Add the current user to the users array
	users.push(req.session.user);

	// Create the chat data object
	var chatData = {
		users: users,
		isGroupChat: true
	};

	// Create a new chat in the database
	Chat.create(chatData)
	.then(results => res.status(200).send(results)) // If successful, return the chat data
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})
});

// Route to get all chats for the current user
router.get("/", async (req, res, next) => {
	// Find all chats where the current user is a member
	Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
	.populate("users") // Populate the users field
	.populate("latestMessage") // Populate the latestMessage field
	.sort({ updatedAt: -1 }) // Sort by the updated at field in descending order
	.then(async results => {

		// If the unreadOnly query parameter is set to true
		if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
			// Filter the results to only include chats where the latest message has not been read by the current user
			results = results.filter(r => r.latestMessage && !r.latestMessage.readBy.includes(req.session.user._id));
		}

		// Populate the sender field of the latest message
		results = await User.populate(results, { path: "latestMessage.sender" });
		// Return the results
		res.status(200).send(results);	
	})
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})
});

// Route to get a specific chat by ID
router.get("/:chatId", async (req, res, next) => {
	// Find a chat by ID where the current user is a member
	Chat.findOne({_id: req.params.chatId, users: { $elemMatch: { $eq: req.session.user._id } } })
	.populate("users") // Populate the users field
	.then(results => res.status(200).send(results)) // If successful, return the chat data
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})
});

// Route to update a specific chat by ID
router.put("/:chatId", async (req, res, next) => {
	// Update a chat by ID
	Chat.findByIdAndUpdate(req.params.chatId, req.body)
	.then(results => res.sendStatus(204)) // If successful, return a 204 status
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})
});

// Route to get all messages for a specific chat
router.get("/:chatId/messages", async (req, res, next) => {
	// Find all messages for a specific chat ID
	Message.find({ chat: req.params.chatId })
	.populate("sender") // Populate the sender field
	.then(results => res.status(200).send(results)) // If successful, return the messages
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})
});

// Route to mark all messages in a chat as read
router.put("/:chatId/messages/markAsRead", async (req, res, next) => {
	// Update all messages in a chat to add the current user to the readBy array
	Message.updateMany({ chat: req.params.chatId }, { $addToSet: { readBy: req.session.user._id } })
	.then(() => res.sendStatus(204)) // If successful, return a 204 status
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})
});

// Export the router
module.exports = router;
