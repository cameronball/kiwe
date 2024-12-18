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
	boosted: { type: Boolean, default: false },
	image: { type: String, default: "" },
	code: { type: String, default: "" },
	pollTitle: { type: String, default: "" },
	option1: { type: String, default: "" },
	option2: { type: String, default: "" },
	votes1: [{ type: Schema.Types.ObjectId, ref: "User" }],
	votes2: [{ type: Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

var Post = mongoose.model('Post', PostSchema);
module.exports = Post;
