const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const KeysSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    key: { type: String, trim: true },
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
}, { timestamps: true });

module.exports = mongoose.model('Keys', KeysSchema);
