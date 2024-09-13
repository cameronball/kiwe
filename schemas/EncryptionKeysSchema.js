const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    key: { type: String, trim: true },
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
}, { timestamps: true });

module.exports = mongoose.model('EncryptionKeys', EncryptionKeysSchema);
