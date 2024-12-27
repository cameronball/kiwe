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

if (!fs.existsSync(path.join(__dirname, '../../uploads/images'))) {
    fs.mkdirSync(path.join(__dirname, '../../uploads/images'), { recursive: true });
}

const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: false }));

// Route to get posts
router.get("/", async (req, res, next) => {
	
    // Create a search object from the query parameters
	var searchObj = req.query;

    // If the isReply parameter is set, filter posts by whether they are a reply or not
	if(searchObj.isReply !== undefined) {
		var isReply = searchObj.isReply == "true";
		searchObj.replyTo = { $exists: isReply };
		delete searchObj.isReply;
	}

    // If the search parameter is set, filter posts by their content
	if(searchObj.search !== undefined) {
		searchObj.content = { $regex: searchObj.search, $options: "i" };
		delete searchObj.search;
	}

    // If the bookmarksOnly parameter is set, filter posts by the user's bookmarks
	if (searchObj.bookmarksOnly !== undefined) {
	        var bookmarksOnly = searchObj.bookmarksOnly == "true";
	
	        if (bookmarksOnly) {
                // If the user has no bookmarks, return an empty result set
	            if (!req.session.user.bookmarks || req.session.user.bookmarks.length === 0) {
	                return res.status(200).send([]);
	            }
	
                // Filter posts by the bookmarked IDs
	            searchObj._id = { $in: req.session.user.bookmarks };
	        }
	
	        delete searchObj.bookmarksOnly;
	    }

    // If the followingOnly parameter is set, filter posts by the users that the current user is following
	if(searchObj.followingOnly !== undefined) {
		var followingOnly = searchObj.followingOnly == "true";

		if(followingOnly) {
            // Create an array of user IDs
			var objectIds = [];

            // If the user has no following list, create an empty array
			if(!req.session.user.following) {
				req.session.user.following = [];	
			}

            // Add the user IDs to the array
			req.session.user.following.forEach(user => {
				objectIds.push(user);
			})
			
            // Add the current user ID to the array
			objectIds.push(req.session.user._id);
            // Filter posts by the users in the array
			searchObj.postedBy = { $in: objectIds };
		}

		delete searchObj.followingOnly;
	}

    // If the trendingPage parameter is set, get the trending posts
	if(searchObj.trendingPage !== undefined) {
		var trendingPage = searchObj.trendingPage == "true";
		delete searchObj.trendingPage;
		var results = await getTrendingPosts();
		return res.status(200).send(results);
	}

    // Get the posts with the search object
	var results = await getPosts(searchObj);
	// Return the posts
	res.status(200).send(results);
})

// Route to get a specific post by ID
router.get("/:id", async (req, res, next) => {
	
    // Get the post ID from the URL parameters
	var postId = req.params.id;

    // Try to get the post data
	try {
        // Get the post data with the post ID
		var postData = await getPosts({ _id: postId });
        // If no post is found, return a 404 error
		if (postData.length == 0) {
			return res.sendStatus(404);
		}
	} catch (error) {
        // If there is an error, return a 404 error
		return res.sendStatus(404);
	}
    // Get the post data
	postData = postData[0];

    // Create a results object
	var results = {
		postData: postData
	}

    // If the post is a reply, add the replyTo field to the results object
	if(postData.replyTo !== undefined) {
		results.replyTo = postData.replyTo;
	}

    // Get the replies for the post and add them to the results object
	results.replies = await getPosts({ replyTo: postId });

    // Return the results object
	res.status(200).send(results);
})

function sanitizeInput(input) {
	// Limit length to 500 characters
	const MAX_LENGTH = 500;
	input = input.slice(0, MAX_LENGTH);
  
	// Remove non-printable characters
	return input.replace(/[^\x20-\x7E]/g, '');
  }

// Route to create a new post
router.post("/", upload.single("croppedImage"), async (req, res, next) => {
	
    // Initialize variables to check if the post includes an image, code, or poll
	var includesImage = false;
	var includesCode = false;
	var includesPoll = false;

    // If code content is provided, sanitize it and set the includesCode variable to true
	if(req.body.codeContent) {
		var code = sanitizer.escape(req.body.codeContent);
		includesCode = true;
	}

    // If poll data is provided, sanitize it and set the includesPoll variable to true
	if(req.body.pollTitle) {
		var pollTitle = sanitizer.escape(req.body.pollTitle);
		var option1 = sanitizer.escape(req.body.option1);
		var option2 = sanitizer.escape(req.body.option2);
		includesPoll = true;
	}
	
    // If a file is provided, get the file path and set the includesImage variable to true
	if(req.file) {
		var filePath = `/uploads/images/${req.file.filename}.png`;
		var tempPath = req.file.path;
		var targetPath = path.join(__dirname, `../../${filePath}`);

        // Rename the file
		fs.rename(tempPath, targetPath, async error => {
            // If there is an error, log it and return a 400 error
			if(error != null) {
				console.log(error);
				return res.sendStatus(400);
			}
		})

		var includesImage = true;
	}

    // Sanitize the content
	sanitizedContent = sanitizer.escape(req.body.content);

    // If no content, image, or code is provided, return a 400 error
	if (!req.body.content && filePath == null && !includesCode) {
		console.log("Content param not sent with request");
		return res.sendStatus(400);
	}

    // If content is provided, check for hashtags and put them in a link
	if (req.body.content) {
		var hashtagRegex = /#[a-zA-Z0-9]+/g;
		sanitizedContent = sanitizedContent.replace(hashtagRegex, function(matched){
			var encodedHashtag = encodeURIComponent(matched);
			return "<a style='color:var(--blue);' href='https://kiwe.social/search/query/" + encodedHashtag + "'>" + matched + "</a>";
		});
	}
	else {
        // If no content is provided, set sanitizedContent to an empty string
		sanitizedContent = "";
	}

    // Create the post data object based on the type of post
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
	else if (includesPoll) {
		var postData = {
			content: sanitizedContent,
			postedBy: req.session.user,
			pollTitle: pollTitle,
			option1: option1,
			option2: option2
		}
	}
	else {
		var postData = {
			content: sanitizedContent,
			postedBy: req.session.user
		}
	}

    // If the post is a reply, add the replyTo field to the post data
	if (req.body.replyTo) {
		postData.replyTo = req.body.replyTo;
	}

    // Create the post in the database
	Post.create(postData)
	.then(async newPost => {
        // Populate the postedBy field
		newPost = await User.populate(newPost, { path: "postedBy" });

        // If the post is a reply, populate the replyTo field and insert a notification
		if (newPost.replyTo !== undefined) {
			newPostReplyTo = await Post.populate(newPost, { path: "replyTo" });
			newPostReplyTo = newPostReplyTo.replyTo.postedBy;
			await Notification.insertNotification(newPostReplyTo, newPost.postedBy._id, "reply", newPost._id);
		}

        // Return the new post
		res.status(201).send(newPost);
	})
	.catch(() => {
        // Log any errors
		console.log("Create post failed");
        // Return a 400 error
		return res.sendStatus(400);
	});
})

// Route to handle liking a post
router.put("/:id/like", async (req, res, next) => {
    // Get the post ID from the URL parameters
	var postId = req.params.id;
    // Get the user ID from the session
	var userId = req.session.user._id;

    // Check if the post is already liked by the user
	var isLiked = req.session.user.likes && req.session.user.likes.includes(postId);

    // Determine whether to add or remove the like based on its current status
	var option = isLiked ? "$pull" : "$addToSet";

	// Update the user's likes in the database and update the session
	req.session.user = await User.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true })
	.catch(error => {
        // Log any errors
		console.log(error);
        // Return a 400 error
		res.sendStatus(400);
	});

    // Update the post's likes in the database
	var post = await Post.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true })
	.catch(error => {
        // Log any errors
		console.log(error);
        // Return a 400 error
		res.sendStatus(400);
	});

    // If the post was not liked, insert a notification
	if (!isLiked) {
		await Notification.insertNotification(post.postedBy, userId, "postLike", post._id);
	}

    // Return the updated post
	res.status(200).send(post);
})

// Route to handle voting on a poll
router.put("/:id/vote", async (req, res, next) => {
    // Get the post ID from the URL parameters
	var postId = req.params.id;
    // Get the vote choice from the body
	var voteChoice = req.body.voteChoice;
    // Get the user ID from the session
	var userId = req.session.user._id;

    // If the vote choice is false, add the user to the votes1 array
	if (voteChoice == 'false') {
		var post = await Post.findByIdAndUpdate(postId, { $addToSet: { votes1: userId } }, { new: true })
		.catch(error => {
            // Log any errors
			console.log(error);
            // Return a 400 error
			res.status(400).send(error);
		});
	}
    // If the vote choice is true, add the user to the votes2 array
	else if (voteChoice == 'true') {
		var post = await Post.findByIdAndUpdate(postId, { $addToSet: { votes2: userId } }, { new: true })
		.catch(error => {
            // Log any errors
			console.log(error);
            // Return a 400 error
			res.status(400).send(error);
		});
	}
    // If the vote choice is not valid, return a 400 error
	else {
		res.sendStatus(400);
	}
    // Return the updated post
	res.status(202).send(post);
})

// Route to handle resharing a post
router.post("/:id/reshare", async (req, res, next) => {
	
    // Get the post ID from the URL parameters
	var postId = req.params.id;
    // Get the user ID from the session
	var userId = req.session.user._id;

    // Try to delete the reshare
	var deletedPost = await Post.findOneAndDelete({postedBy: userId, reshareData: postId})
	.catch(error => {
        // Log any errors
		console.log(error);
        // Return a 400 error
		res.sendStatus(400);
	});

    // Determine whether to add or remove the reshare based on its current status
	var option = deletedPost != null ? "$pull" : "$addToSet";
	
    // Set the repost variable
	var repost = deletedPost;

    // If the repost is null, create a new post
	if (repost == null) {
		repost = await Post.create({ postedBy: userId, reshareData: postId })
		.catch(error => {
            // Log any errors
			console.log(error);
            // Return a 400 error
			res.sendStatus(400);
		});
	}

    // Update the user's reshares in the database and update the session
	req.session.user = await User.findByIdAndUpdate(userId, { [option]: { reshares: repost._id } }, { new: true })
	.catch(error => {
        // Log any errors
		console.log(error);
        // Return a 400 error
		res.sendStatus(400);
	});

    // Update the post's reshare users in the database
	var post = await Post.findByIdAndUpdate(postId, { [option]: { reshareUsers: userId } }, { new: true })
	.catch(error => {
        // Log any errors
		console.log(error);
        // Return a 400 error
		res.sendStatus(400);
	});

    // If the post was not reshared, insert a notification
	if (!deletedPost) {
		await Notification.insertNotification(post.postedBy, userId, "postReshare", post._id);
	}

    // Return the updated post
	res.status(200).send(post);
})

// Route to delete a post
router.delete("/:id", async (req, res, next) => {
    // Get the post ID from the URL parameters
	var postId = req.params.id;
    // Get the post data
	var postData = await getPosts({ _id: postId });
    // If no post is found, return a 404 error
	if (postData.length == 0) {
		return res.sendStatus(404);
	}

    // Get the user IDs
	var reqUserId = req.session.user._id + "";
	var postUserId = postData[0].postedBy._id.toString();

    // If the user ID does not match the post user ID and the user is not an admin, return a 403 error
	if (reqUserId != postUserId){
		if (req.session.user.admin != true){
			return res.sendStatus(403);
		}
	}

    // Delete the post from the database
	Post.findByIdAndDelete(req.params.id)
	.then(result => res.sendStatus(202)) // If successful, return a 202 status
	.catch(error => {
        // Log any errors
		console.log(error);
        // Return a 400 error
		res.sendStatus(400);
	});
})

// Route to update a post
router.put("/:id", async (req, res, next) => {
    // Get the post ID from the URL parameters
	var postId = req.params.id;
    // Get the post data
	var postData = await getPosts({ _id: postId });
    // If no post is found, return a 404 error
	if (postData.length == 0) {
		return res.sendStatus(404);
	}

    // Get the user IDs
	var reqUserId = req.session.user._id + "";
	var postUserId = postData[0].postedBy._id.toString();

    // If the user ID does not match the post user ID and the user is not an admin, return a 403 error
	if (reqUserId != postUserId){
		if (req.session.user.admin != true){
			return res.sendStatus(403);
		}
	}
	
    // If the pinned parameter is set, unpin all other posts by the current user
	if (req.body.pinned !== undefined) {
		await Post.updateMany({ postedBy: req.session.user }, { pinned: false })
		.catch(error => {
            // Log any errors
			console.log(error);
            // Return a 400 error
			res.sendStatus(400);
		});
	}

    // Update the post
	Post.findByIdAndUpdate(req.params.id, req.body)
	.then(() => res.sendStatus(204)) // If successful, return a 204 status
	.catch(error => {
        // Log any errors
		console.log(error);
        // Return a 400 error
		res.sendStatus(400);
	});
})

// Function to get posts with population and reply counts
async function getPosts(filter) {
    try {
        // Fetch the posts with the initial population
        var results = await Post.find(filter)
            .populate("postedBy")
            .populate("reshareData")
            .populate("replyTo")
            .sort({ createdAt: -1 });

        // Further populate the results
        results = await User.populate(results, { path: "replyTo.postedBy" });
        results = await User.populate(results, { path: "reshareData.postedBy" });

        // Extract all unique post IDs, including those from reshareData and replyTo
        const postIds = results.map(post => post._id);
        const resharedPostIds = results
            .filter(post => post.reshareData)
            .map(post => post.reshareData._id);
        const replyToIds = results
            .filter(post => post.replyTo)
            .map(post => post.replyTo._id);
        const allPostIds = [...new Set([...postIds, ...resharedPostIds, ...replyToIds])];

        // Count the replies for each post
        const replyCounts = await Post.aggregate([
            {
                $match: {
                    replyTo: { $in: allPostIds }
                }
            },
            {
                $group: {
                    _id: "$replyTo",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a map for easy lookup of reply counts
        const replyCountMap = replyCounts.reduce((map, item) => {
            map[item._id] = item.count;
            return map;
        }, {});

        // Attach the reply count to each post and its replyTo if exists
        results = results.map(post => {
            post = post.toObject();  // Convert Mongoose document to plain JS object if necessary
            post.replyCount = replyCountMap[post._id] || 0;  // Default to 0 if no replies

            // If the post is a reshared post, set replyCount for the reshared data
            if (post.reshareData) {
                post.reshareData.replyCount = replyCountMap[post.reshareData._id] || 0;
            }

            // If the post is a reply, set replyCount for the replied post
            if (post.replyTo) {
                post.replyTo.replyCount = replyCountMap[post.replyTo._id] || 0;
            }

            return post;
        });

        return results;
    } catch (error) {
        // Log any errors
        console.error("Error fetching posts: ", error);
        return [];
    }
}

// Function to get trending posts
async function getTrendingPosts() {
	try {
        // Fetch the posts with the initial population, filtering by posts with at least 3 likes
	    var results = await Post.find({ "likes.3": { "$exists": true } })
	    .populate("postedBy")
            .populate("reshareData")
            .populate("replyTo")
            .sort({ createdAt: -1 });

        // Further populate the results
        results = await User.populate(results, { path: "replyTo.postedBy" });
        results = await User.populate(results, { path: "reshareData.postedBy" });

        // Extract all unique post IDs, including those from reshareData
        const postIds = results.map(post => post._id);
        const resharedPostIds = results
            .filter(post => post.reshareData)
            .map(post => post.reshareData._id);
        const allPostIds = [...new Set([...postIds, ...resharedPostIds])];

        // Count the replies for each post
        const replyCounts = await Post.aggregate([
            {
                $match: {
                    replyTo: { $in: allPostIds }
                }
            },
            {
                $group: {
                    _id: "$replyTo",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a map for easy lookup of reply counts
        const replyCountMap = replyCounts.reduce((map, item) => {
            map[item._id] = item.count;
            return map;
        }, {});

        // Attach the reply count to each post
        results = results.map(post => {
            post = post.toObject();  // Convert Mongoose document to plain JS object if necessary
            post.replyCount = replyCountMap[post._id] || 0;  // Default to 0 if no replies

            // If the post is a reshared post, set replyCount for the reshared data
            if (post.reshareData) {
                post.reshareData.replyCount = replyCountMap[post.reshareData._id] || 0;
            }

            return post;
        });

        return results;
    } catch (error) {
        // Log any errors
        console.error("Error fetching posts: ", error);
        return [];
    }
}

// Export the router
module.exports = router;
