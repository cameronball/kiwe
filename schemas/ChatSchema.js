const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    isEncrypted: { type: Boolean, default: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
