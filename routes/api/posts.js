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

router.get("/", async (req, res, next) => {

	var searchObj = req.query;

	if(searchObj.isReply !== undefined) {
		var isReply = searchObj.isReply == "true";
		searchObj.replyTo = { $exists: isReply };
		delete searchObj.isReply;
	}

	if(searchObj.search !== undefined) {
		searchObj.content = { $regex: searchObj.search, $options: "i" };
		delete searchObj.search;
	}

	if(searchObj.followingOnly !== undefined) {
		var followingOnly = searchObj.followingOnly == "true";

		if(followingOnly) {
			var objectIds = [];

			if(!req.session.user.following) {
				req.session.user.following = [];	
			}

			req.session.user.following.forEach(user => {
				objectIds.push(user);
			})
			
			objectIds.push(req.session.user._id);
			searchObj.postedBy = { $in: objectIds };
		}

		delete searchObj.followingOnly;
	}

	if(searchObj.trendingPage !== undefined) {
		var trendingPage = searchObj.trendingPage == "true";
		delete searchObj.trendingPage;
		var results = await getTrendingPosts();
		return res.status(200).send(results);
	}

	var results = await getPosts(searchObj);
	res.status(200).send(results);
})

router.get("/:id", async (req, res, next) => {
	
	var postId = req.params.id;

	try {
		var postData = await getPosts({ _id: postId });
		if (postData.length == 0) {
			return res.sendStatus(404);
		}
	} catch (error) {
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

router.post("/", upload.single("croppedImage"), async (req, res, next) => {
	
	var includesImage = false;
	var includesCode = false;

	if(req.body.codeContent) {
		var code = sanitizer.escape(req.body.codeContent);
		includesCode = true;
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

	sanitizedContent = sanitizer.escape(req.body.content);


	if (!req.body.content && filePath == null && !includesCode) {
		console.log("Content param not sent with request");
		return res.sendStatus(400);
	}

	if (req.body.content) {
		// Check for hashtags and put them in a link if they exist
		var hashtagRegex = /#[a-zA-Z0-9]+/g;
		sanitizedContent = sanitizedContent.replace(hashtagRegex, function(matched){
			var encodedHashtag = encodeURIComponent(matched);
			return "<a style='color:var(--blue);' href='https://kiwe.social/search/query/" + encodedHashtag + "'>" + matched + "</a>";
		});
	}
	else {
		sanitizedContent = "";
	}

	if(includesImage) {
		var postData = {
			content: sanitizedContent,
			postedBy: req.session.user,
			image: filePath
		}
	} 
	else if(includesCode) {
		var postData = {
			content: sanitizedContent,
			postedBy: req.session.user,
			code: code
		}
	}
	else {
		var postData = {
			content: sanitizedContent,
			postedBy: req.session.user
		}
	}

	if (req.body.replyTo) {
		postData.replyTo = req.body.replyTo;
	}

	Post.create(postData)
	.then(async newPost => {
		newPost = await User.populate(newPost, { path: "postedBy" });

		if (newPost.replyTo !== undefined) {
			newPostReplyTo = await Post.populate(newPost, { path: "replyTo" });
			newPostReplyTo = newPostReplyTo.replyTo.postedBy;
			await Notification.insertNotification(newPostReplyTo, newPost.postedBy._id, "reply", newPost._id);
		}

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

	if (!isLiked) {
		await Notification.insertNotification(post.postedBy, userId, "postLike", post._id);
	}

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

	if (!deletedPost) {
		await Notification.insertNotification(post.postedBy, userId, "postReshare", post._id);
	}

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

router.put("/:id", async (req, res, next) => {
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
	
	if (req.body.pinned !== undefined) {
		await Post.updateMany({ postedBy: req.session.user }, { pinned: false })
		.catch(error => {
			console.log(error);
			res.sendStatus(400);
		});
	}

	Post.findByIdAndUpdate(req.params.id, req.body)
	.then(() => res.sendStatus(204))
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

async function getTrendingPosts() {
	var results = await Post.find({ "likes.3": { "$exists": true } })
	.populate("postedBy")
	.populate("reshareData")
	.populate("replyTo")
	.sort({ createdAt: -1 })
	.catch(error => console.log(error))

	results = await User.populate(results, { path: "replyTo.postedBy" });
	return await User.populate(results, { path: "reshareData.postedBy" });
}

module.exports = router;
