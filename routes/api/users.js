const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.put("/:userId/follow", async (req, res, next) => {

	var userId = req.params.userId;

	var user = await User.findById(userId);
	
	if (user == null) return res.sendStatus(404);

	var isFollowing = user.followers && user.followers.includes(req.session.user._id);

	var option = isFollowing ? "$pull" : "$addToSet";

	req.session.user = await User.findByIdAndUpdate(req.session.user._id, { [option]: { following: userId } }, { new: true })
		.catch(error => {
			console.log(error);
			res.sendStatus(400);
		});
	
	User.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } }, { new: true })
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	});

	return res.status(200).send(req.session.user);

})

module.exports = router;