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

// Route to handle bookmarking a post
router.put("/:id/bookmark", async (req, res, next) => {
    // Get the post ID from the URL parameters
	var postId = req.params.id;
    // Get the user ID from the session
	var userId = req.session.user._id;

    // Check if the post is already bookmarked by the user
	var isBookmarked = req.session.user.bookmarks && req.session.user.bookmarks.includes(postId);

    // Determine whether to add or remove the bookmark based on its current status
	var option = isBookmarked ? "$pull" : "$addToSet";

    // Update the user's bookmarks in the database and update the session
	req.session.user = await User.findByIdAndUpdate(userId, { [option]: { bookmarks: postId } }, { new: true })
	.catch(error => {
        // Log any errors
		console.log(error);
        // Return a 400 error
		res.sendStatus(400);
	});

    // Return the updated user object
	res.status(200).send(req.session.user);
})

// Export the router
module.exports = router;
