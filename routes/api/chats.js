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

const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    candidateCount: 1,
    maxOutputTokens: 8192,
    temperature: 0.5,
  },
  systemInstruction: "You are Paris. You are a helpful chatbot on a micro-blogging social media site named Kiwe. Your aim is to assist users with any questions or queries they have or to just provide them with entertainment. You aren't yet able to do anything for them on the site such as posting or changing their settings, and requests such as these should simply be refused with a simple and friendly phrase such as, 'I'm sorry, I cannot do that yet, however, we are working on it hard and that will be available soon'. You can be as detailed and verbose as you want when necessary, but if it isn't necessary, then keep responses to the point and don't go off on tangents. You are encouraged to make occasional use of emojis where necessary, but don't overuse them.",
});


app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", async (req, res, next) => {
	if(!req.body.users) {
		console.log("Users param not sent with request");
		return res.sendStatus(400);
	}

	var users = JSON.parse(req.body.users);

	if(users.length == 0) {
		console.log("Users array is empty");
		return res.sendStatus(400);
	}

	users.push(req.session.user);

	var chatData = {
		users: users,
		isGroupChat: true
	};

	Chat.create(chatData)
	.then(results => res.status(200).send(results))
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	})
});

router.get("/", async (req, res, next) => {
	Chat.find({ users: { $elemMatch: { $eq: req.session.user._id } } })
	.populate("users")
	.populate("latestMessage")
	.sort({ updatedAt: -1 })
	.then(async results => {

		if(req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
			results = results.filter(r => r.latestMessage && !r.latestMessage.readBy.includes(req.session.user._id));
		}

		results = await User.populate(results, { path: "latestMessage.sender" });
		res.status(200).send(results);	
	})
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	})
});

router.get("/:chatId", async (req, res, next) => {
	Chat.findOne({_id: req.params.chatId, users: { $elemMatch: { $eq: req.session.user._id } } })
	.populate("users")
	.then(results => res.status(200).send(results))
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	})
});

router.put("/:chatId", async (req, res, next) => {
	Chat.findByIdAndUpdate(req.params.chatId, req.body)
	.then(results => res.sendStatus(204))
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	})
});

router.get("/:chatId/messages", async (req, res, next) => {
	Message.find({ chat: req.params.chatId })
	.populate("sender")
	.then(results => res.status(200).send(results))
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	})
});

router.put("/:chatId/messages/markAsRead", async (req, res, next) => {
	Message.updateMany({ chat: req.params.chatId }, { $addToSet: { readBy: req.session.user._id } })
	.then(() => res.sendStatus(204))
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	})
});

router.get("/paris", async (req, res, next) => {
	const message = req.body.message;
	const chat = model.startChat({
	history: [
	   {
	     role: "model",
	     parts: [{ text: "Hi! I am Paris, your personal assistant here on Kiwe. What would you like to know or talk about today?" }],
	   },
	 ],
	});
	let result = await chat.sendMessage(message);
	res.status(200).send(result.response.text());
});

module.exports = router;
