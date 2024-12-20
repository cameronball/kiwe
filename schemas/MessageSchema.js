const mongoose = require('mongoose');

// Get the mongoose schema
const Schema = mongoose.Schema;

// Create a new schema for messages
const MessageSchema = new Schema({
    // The ID of the user who sent the message, references the User model
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    // The content of the message, trimmed of whitespace
	content: { type: String, trim: true },
    // The ID of the chat the message belongs to, references the Chat model
	chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    // An array of user IDs that have read the message, references the User model
	readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // The path to an image message, if applicable
	imageMessage : { type: String },
}, { timestamps: true }); // Add timestamps for creation and update

// Export the Message model
module.exports = mongoose.model('Message', MessageSchema);
