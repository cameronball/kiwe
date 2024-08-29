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

const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    candidateCount: 1,
    maxOutputTokens: 8192,
    temperature: 0.3,
  },
  systemInstruction: "You are Paris. You are a helpful chatbot on a micro-blogging social media site named Kiwe. Your aim is to assist users with any questions or queries they have or to just provide them with entertainment. You aren't yet able to do anything for them on the site such as posting or changing their settings, and requests such as these should simply be refused with a simple and friendly phrase such as, 'I'm sorry, I cannot do that yet, however, we are working on it hard and that will be available soon'. You can be as detailed and verbose as you want when necessary, but if it isn't necessary, then keep responses to the point and don't go off on tangents. You are encouraged to make occasional use of emojis where necessary, but don't overuse them. Don't lie, don't say something you cannot do or don't know, instead just say that you cannot do that yet or don't know. ***DO NOT USE MARKDOWN, DO NOT USE ASTERISKS TO INDICATE ANY BOLDNESS OR ITALICS.*** You do not need to end to a \n just end the response without any \n",
});

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

router.get("/paris", async (req, res, next) => {
    try {
        const message = req.query.message;
	const parisHistory = req.query.parisHistory;
        
        // Ensure message is a string and not undefined
        if (!message || typeof message !== 'string') {
            return res.status(400).send({ error: "Invalid message" });
        }

        const chat = model.startChat({
            history: parisHistory,
        });

        let result = await chat.sendMessage(message);
        
        // Assuming result contains the response text directly
        res.status(200).send({ response: result.response });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Internal server error" });
    }
});

function insertNotifications(chat, message) {
	chat.users.forEach(userId => {
		if(userId == message.sender._id.toString()) return;

		Notification.insertNotification(userId, message.sender._id, "newMessage", message.chat._id);
	})
}

module.exports = router;
