const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const sanitizer = require('sanitizer');
const bcrypt = require('bcrypt');

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationSchema');

app.use(bodyParser.urlencoded({ extended: false }));

// Route to get users
router.get("/", async (req, res, next) => {
    // Create a search object from the query parameters
    var searchObj = req.query;

    // If a search query is provided, filter users by first name, last name, or username
    if (req.query.search !== undefined) {
        searchObj = {
            $or: [
                { firstName: { $regex: req.query.search, $options: "i" } },
                { lastName: { $regex: req.query.search, $options: "i" } },
                { username: { $regex: req.query.search, $options: "i" } },
            ]
        }
    }

    // Find users matching the search criteria
    User.find(searchObj)
    .then(results => res.status(200).send(results)) // If successful, return the users
    .catch(error => { // If there is an error
        console.log(error);
        res.sendStatus(400); // Return a 400 error
    })

});

// Route to follow or unfollow a user
router.put("/:userId/follow", async (req, res, next) => {
    // Get the user ID from the URL parameters
	var userId = req.params.userId;

    // Find the user with the given ID
	var user = await User.findById(userId);
	
    // If no user is found, return a 404 error
	if (user == null) return res.sendStatus(404);

    // Check if the current user is already following the target user
	var isFollowing = user.followers && user.followers.includes(req.session.user._id);

    // Determine whether to add or remove the follower based on its current status
	var option = isFollowing ? "$pull" : "$addToSet";

    // Update the current user's following list in the database and update the session
	req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId } }, { new: true })
		.catch(error => {
            // Log any errors
			console.log(error);
            // Return a 400 error
			res.sendStatus(400);
		});
	
    // Update the target user's followers list in the database
	User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } }, { new: true })
	.catch(error => {
        // Log any errors
		console.log(error);
        // Return a 400 error
		res.sendStatus(400);
	});

    // If the user was not already following the target user, insert a notification
    if (!isFollowing) {
        await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id);
    }

    // Return the updated current user
	return res.status(200).send(req.session.user);

})

// Route to get the users that a specific user is following
router.get("/:userId/following", async (req, res, next) => {
    // Find the user with the given ID and populate their following list
    User.findById(req.params.userId)
    .populate("following")
    .then(results => {
        // Return the user with their following list
        res.status(200).send(results);
    })
    .catch(error => {
        // Log any errors
        console.log(error);
        // Return a 400 error
        res.sendStatus(400);
    })
});

// Route to get the followers of a specific user
router.get("/:userId/followers", async (req, res, next) => {
    // Find the user with the given ID and populate their followers list
    User.findById(req.params.userId)
    .populate("followers")
    .then(results => {
        // Return the user with their followers list
        res.status(200).send(results);
    })
    .catch(error => {
        // Log any errors
        console.log(error);
        // Return a 400 error
        res.sendStatus(400);
    })
});

// Route to upload a profile picture
router.post("/profilePicture", upload.single("croppedImage"), async (req, res, next) => {
    // If no file is provided, return a 400 error
    if(!req.file) {
        console.log("No files were uploaded.");
        return res.sendStatus(400);
    }
    
    // Create the file path
    var filePath = `/uploads/images/${req.file.filename}.png`;
    // Get the temporary file path
    var tempPath = req.file.path;
    // Create the target file path
    var targetPath = path.join(__dirname, `../../${filePath}`);

    // Rename the file
    fs.rename(tempPath, targetPath, async error => {
        // If there is an error, log it and return a 400 error
        if(error != null) {
            console.log(error);
            return res.sendStatus(400);
        }

        // Update the user's profile picture in the database and update the session
        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { profilePic: filePath }, { new: true })
        // Return a 204 status
        res.sendStatus(204);
    })
});

// Route to upload a cover photo
router.post("/coverPhoto", upload.single("croppedImage"), async (req, res, next) => {
    // If no file is provided, return a 400 error
    if(!req.file) {
        console.log("No files were uploaded.");
        return res.sendStatus(400);
    }
    
    // Create the file path
    var filePath = `/uploads/images/${req.file.filename}.png`;
    // Get the temporary file path
    var tempPath = req.file.path;
    // Create the target file path
    var targetPath = path.join(__dirname, `../../${filePath}`);

    // Rename the file
    fs.rename(tempPath, targetPath, async error => {
        // If there is an error, log it and return a 400 error
        if(error != null) {
            console.log(error);
            return res.sendStatus(400);
        }

        // Update the user's cover photo in the database and update the session
        req.session.user = await User.findByIdAndUpdate(req.session.user._id, { coverPhoto: filePath }, { new: true })
        // Return a 204 status
        res.sendStatus(204);
    })
});

// Export the router
module.exports = router;
