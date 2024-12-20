const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const sanitizer = require('sanitizer');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');
const Notification = require('../../schemas/NotificationSchema');

app.use(bodyParser.urlencoded({ extended: false }));

// Route to get all notifications for the current user
router.get("/", async (req, res, next) => {
	
    // Create a search object to find notifications for the current user that are not new messages
	var searchObj = { userTo: req.session.user._id, notificationType: { $ne: "newMessage" } }

    // If the unreadOnly query parameter is set to true, add a filter for unread notifications
	if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
		searchObj.opened = false;
	}

    // Find all notifications matching the search criteria
	Notification.find(searchObj)
	.populate("userTo") // Populate the userTo field
	.populate("userFrom") // Populate the userFrom field
	.populate("notificationType") // Populate the notificationType field
	.populate("entityId") // Populate the entityId field
	.sort({ createdAt: -1 }) // Sort by the created at field in descending order
	.then(results => res.status(200).send(results)) // If successful, return the notifications
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})

});

// Route to mark a specific notification as opened
router.put("/:id/markAsOpened", async (req, res, next) => {
	
    // Find a notification by ID and update its opened status to true
	Notification.findByIdAndUpdate(req.params.id, { opened: true })
	.then(() => res.sendStatus(204)) // If successful, return a 204 status
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})

});

// Route to get the latest notification for the current user
router.get("/latest", async (req, res, next) => {
    // Find the latest notification for the current user
	Notification.findOne({ userTo: req.session.user._id })
	.populate("userTo") // Populate the userTo field
	.populate("userFrom") // Populate the userFrom field
	.populate("notificationType") // Populate the notificationType field
	.populate("entityId") // Populate the entityId field
	.sort({ createdAt: -1 }) // Sort by the created at field in descending order
	.then(results => res.status(200).send(results)) // If successful, return the notification
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})
});

// Route to mark all notifications for the current user as opened
router.put("/markAsOpened", async (req, res, next) => {
	
    // Update all notifications for the current user to set their opened status to true
	Notification.updateMany({ userTo: req.session.user._id }, { opened: true })
	.then(() => res.sendStatus(204)) // If successful, return a 204 status
	.catch(error => { // If there is an error
		console.log(error);
		res.sendStatus(400); // Return a 400 error
	})

});

// Export the router
module.exports = router;
