const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res, next) => {

	var searchObj = req.query;

	if(searchObj.isReply !== undefined) {
		var isReply = searchObj.isReply == "true";
		searchObj.replyTo = { $exists: isReply };
		delete searchObj.isReply;
	}

	var results = await getPosts(searchObj);
	res.status(200).send(results);
})

router.get("/:id", async (req, res, next) => {
	
	var postId = req.params.id;

	var postData = await getPosts({ _id: postId });
	if (postData.length == 0) {
		return res.sendStatus(404);
	}
	postData = postData[0];

	var results = {
		postData: postData
	}

	if(postData.replyTo !== undefined) {
		results.replyTo = postData.replyTo;
	}

	results.replies = await getPosts({ replyTo: postId });

	res.status(200).send(results);
})

router.post("/", async (req, res, next) => {
	
	if (!req.body.content) {
		console.log("Content param not sent with request");
		return res.sendStatus(400);
	}

	var postData = {
		content: req.body.content,
		postedBy: req.session.user
	}

	if (req.body.replyTo) {
		postData.replyTo = req.body.replyTo;
	}

	Post.create(postData)
	.then(async newPost => {
		newPost = await User.populate(newPost, { path: "postedBy" });

		res.status(201).send(newPost);
	})
	.catch(() => {
		console.log("Create post failed");
		return res.sendStatus(400);
	});
})

router.put("/:id/like", async (req, res, next) => {

	var postId = req.params.id;
	var userId = req.session.user._id;

	var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

	var option = isLiked ? "$pull" : "$addToSet";

	// Insert user like
	req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	});

	// Insert post like
	var post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	});

	res.status(200).send(post);
})

router.post("/:id/reshare", async (req, res, next) => {

	
	var postId = req.params.id;
	var userId = req.session.user._id;

	// Try and delete reshare
	var deletedPost = await Post.findOneAndDelete({postedBy: userId, reshareData: postId})
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	});

	var option = deletedPost != null ? "$pull" : "$addToSet";
	
	var repost = deletedPost;

	if (repost == null) {
		repost = await Post.create({ postedBy: userId, reshareData: postId })
		.catch(error => {
			console.log(error);
			res.sendStatus(400);
		});
	}

	// Insert user reshare
	req.session.user = await User.findByIdAndUpdate(userId, { [option]: { reshares: repost._id } }, { new: true })
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	});

	// Insert post reshare
	var post = await Post.findByIdAndUpdate(postId, { [option]: { reshareUsers: userId } }, { new: true })
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	});

	res.status(200).send(post);
})

router.delete("/:id", async (req, res, next) => {
	var postId = req.params.id;
	var postData = await getPosts({ _id: postId });
	if (postData.length == 0) {
		return res.sendStatus(404);
	}

	var reqUserId = req.session.user._id + "";
	var postUserId = postData[0].postedBy._id.toString();

	if (reqUserId != postUserId){
		if (req.session.user.admin != true){
			return res.sendStatus(403);
		}
	}

	Post.findByIdAndDelete(req.params.id)
	.then(result => res.sendStatus(202))
	.catch(error => {
		console.log(error);
		res.sendStatus(400);
	});
})

async function getPosts(filter) {
	var results = await Post.find(filter)
	.populate("postedBy")
	.populate("reshareData")
	.populate("replyTo")
	.sort({ createdAt: -1 })
	.catch(error => console.log(error))

	results = await User.populate(results, { path: "replyTo.postedBy" });
	return await User.populate(results, { path: "reshareData.postedBy" });
}	

module.exports = router;