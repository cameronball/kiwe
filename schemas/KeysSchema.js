const mongoose = require('mongoose');

// Get the mongoose schema
const Schema = mongoose.Schema;

// Create a new schema for keys
const KeysSchema = new Schema({
    // The ID of the user associated with the key, references the User model
    user: { type: Schema.Types.ObjectId, ref: "User" },
    // The key itself, trimmed of whitespace
    key: { type: String, trim: true },
    // The ID of the chat associated with the key, references the Chat model
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
}, { timestamps: true }); // Add timestamps for creation and update

// Export the Keys model
module.exports = mongoose.model('Keys', KeysSchema);
