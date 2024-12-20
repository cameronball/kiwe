const mongoose = require('mongoose');

// Get the mongoose schema
const Schema = mongoose.Schema;

// Create a new schema for posts
const PostSchema = new Schema({
    // The content of the post, trimmed of whitespace
	content: { type: String, trim: true },
    // The ID of the user who posted the post, references the User model and is required
	postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Whether the post is pinned, defaults to false
	pinned: Boolean,
    // An array of user IDs that have liked the post, references the User model
	likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // An array of user IDs that have reshared the post, references the User model
	reshareUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // The ID of the post that this post is a reshare of, references the Post model
	reshareData: { type: Schema.Types.ObjectId, ref: "Post" },
    // The ID of the post that this post is a reply to, references the Post model
	replyTo: { type: Schema.Types.ObjectId, ref: "Post" },
    // Whether the post is pinned, defaults to false
	pinned: { type: Boolean, default: false },
    // Whether the post is boosted, defaults to false
	boosted: { type: Boolean, default: false },
    // The path to an image in the post, if applicable, defaults to an empty string
	image: { type: String, default: "" },
    // The code content of the post, if applicable, defaults to an empty string
	code: { type: String, default: "" },
    // The title of the poll if the post is a poll, defaults to an empty string
	pollTitle: { type: String, default: "" },
    // The first poll option, defaults to an empty string
	option1: { type: String, default: "" },
    // The second poll option, defaults to an empty string
	option2: { type: String, default: "" },
    // An array of user IDs that have voted for the first option, references the User model
	votes1: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // An array of user IDs that have voted for the second option, references the User model
	votes2: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true }); // Add timestamps for creation and update

// Create the Post model
var Post = mongoose.model('Post', PostSchema);
// Export the Post model
module.exports = Post;
