const mongoose = require('mongoose');

// Get the mongoose schema
const Schema = mongoose.Schema;

// Create a new schema for chats
const ChatSchema = new Schema({
    // The name of the chat, trimmed of whitespace
    chatName: { type: String, trim: true },
    // Whether the chat is a group chat, defaults to false
    isGroupChat: { type: Boolean, default: false },
    // Whether the chat is encrypted, defaults to true
    isEncrypted: { type: Boolean, default: true },
    // An array of user IDs that are members of the chat, references the User model
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // The ID of the latest message in the chat, references the Message model
    latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true }); // Add timestamps for creation and update

// Export the Chat model
module.exports = mongoose.model('Chat', ChatSchema);
