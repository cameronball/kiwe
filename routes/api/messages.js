const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const sanitizer = require('sanitizer');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", async (req, res, next) => {
	if(!req.body.content || !req.body.chatId) {
		console.log("Bad params sent with request");
		return res.sendStatus(400);
	}

	var newMessage = {
		sender: req.session.user._id,
		content: sanitizer.escape(req.body.content),
		chat: req.body.chatId
	};
	
	Message.create(newMessage)
	.then(async message => {
		message = await message.populate("sender");
		message = await message.populate("chat");
		message = await User.populate(message, { path: "chat.users" });

		Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
		.catch(error => console.log(error));

		res.status(201).send(message);
	})
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	})
});

module.exports = router;