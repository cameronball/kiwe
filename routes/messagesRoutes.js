const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const mongoose = require("mongoose");
const User = require('../schemas/UserSchema');
const Chat = require('../schemas/ChatSchema');
const Keys = require('../schemas/KeysSchema');

// Set the view engine to pug
app.set("view engine", "pug");
// Set the views directory
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

// Route to render the inbox page
router.get("/", (req, res, next) => {
    // Create a payload object
	var payload = {
		pageTitle: "Inbox",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user)
	};
	
    // Render the inbox page with the payload
  	res.status(200).render("inboxPage", payload);
})

// Route to render the new message page
router.get("/new", (req, res, next) => {
    // Create a payload object
	var payload = {
		pageTitle: "New Message",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user)
	};
	
    // Render the new message page with the payload
  	res.status(200).render("newMessage", payload);
})

// Route to render the Paris chatbot page
router.get("/paris", (req, res, next) => {
    // Create a payload object
	var payload = {
		pageTitle: "Paris",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user)
	};

    // Render the Paris chatbot page with the payload
	res.status(200).render("paris", payload);
})

// Route to render a specific chat page
router.get("/:chatId", async (req, res, next) => {
    // Get the user ID from the session
	var userId = req.session.user._id;
    // Get the chat ID from the URL parameters
	var chatId = req.params.chatId;
    // Check if the chat ID is a valid Mongoose object ID
	var isValidId = mongoose.isValidObjectId(chatId);

    // Create a payload object
	var payload = {
		pageTitle: "Chat",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
	};

    // If the chat ID is not valid, set an error message and render the chat page
	if(!isValidId) {
		payload.errorMessage = "Chat not found.";
		return res.status(200).render("chatPage", payload);
	}

    // Find a chat with the given ID where the current user is a member
	var chat = await Chat.findOne({ _id: chatId, users: { $elemMatch: { $eq: userId } } })
	.populate("users");

    // If no chat is found, try to get a chat by user ID
	if(chat == null) {
        // Find the user with the given ID
		var userFound = await User.findById(chatId);

        // If a user is found, get the chat by user ID
		if(userFound != null) {
			chat = await getChatByUserId(userFound._id, userId);
		}
	}

    // If no chat is found, set an error message
	if(chat == null) {
		payload.errorMessage = "Chat not found.";
	} else {
        // If a chat is found, add it to the payload
		payload.chat = chat;
	}
	
    // Render the chat page with the payload
  	res.status(200).render("chatPage", payload);
})

// Function to get or create a chat by user ID
function getChatByUserId(userLoggedInId, otherUserId) {
    // Find a chat with the given users or create a new one
	return Chat.findOneAndUpdate({
		isGroupChat: false,
		users: {
			$size: 2,
			$all: [
				{ $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) }},
				{ $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) }}
			]
		}
	},
	{
        // Set the users array if a new chat is created
		$setOnInsert: {
			users: [userLoggedInId, otherUserId]
		}
	},
	{
        // Return the new chat and upsert if it doesn't exist
		new: true,
		upsert: true
	})
	.populate("users"); // Populate the users field
}

// Export the router
module.exports = router;
