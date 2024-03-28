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

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

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

		var chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
		.catch(error => console.log(error));

		insertNotifications(chat, message);

		res.status(201).send(message);
	})
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	})
});

router.post("/imageMessage", upload.single("croppedImage"), async (req, res, next) => {
	if(!req.body.chatId) {
		console.log("Bad params sent with request");
		return res.sendStatus(400);
	}

	if(req.file) {
		var filePath = `/uploads/images/${req.file.filename}.png`;
		var tempPath = req.file.path;
		var targetPath = path.join(__dirname, `../../${filePath}`);

		fs.rename(tempPath, targetPath, async error => {
			if(error != null) {
				console.log(error);
				return res.sendStatus(400);
			}
		})

		var includesImage = true;
	}
	else {
		console.log("Image not included with request");
		return res.sendStatus(400);
	}

	if (filePath == null) {
		console.log("Image not included with request");
		return res.sendStatus(400);
	}

	var newMessage = {
		sender: req.session.user._id,
		chat: req.body.chatId,
		imageMessage: filePath,
	};
	
	Message.create(newMessage)
	.then(async message => {
		message = await message.populate("sender");
		message = await message.populate("chat");
		message = await User.populate(message, { path: "chat.users" });

		var chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
		.catch(error => console.log(error));

		res.status(201).send(message);
	})
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	})
});

function insertNotifications(chat, message) {
	chat.users.forEach(userId => {
		if(userId == message.sender._id.toString()) return;

		Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
	})
}

module.exports = router;
