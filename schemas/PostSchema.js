const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
	content: { type: String, trim: true },
	postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	pinned: Boolean,
	likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
	reshareUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
	reshareData: { type: Schema.Types.ObjectId, ref: "Post" },
	replyTo: { type: Schema.Types.ObjectId, ref: "Post" },
	pinned: { type: Boolean, default: false },
	image: { type: String, default: "" },
	code: { type: String, default: "" },
}, { timestamps: true });

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;
