const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const sanitizer = require('sanitizer');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: false }));

router.put("/:id/bookmark", async (req, res, next) => {

	var postId = req.params.id;
	var userId = req.session.user._id;

	var isBookmarked = req.session.user.bookmarks && req.session.user.bookmarks.includes(postId);

	var option = isBookmarked ? "$pull" : "$addToSet";

	req.session.user = await User.findByIdAndUpdate(userId, { [option]: { bookmarks: postId } }, { new: true })
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	});

	res.status(200).send(post);
})

module.exports = router;
