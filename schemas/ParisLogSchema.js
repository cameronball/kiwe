const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    request: { type: String, trim: true },
    sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    response: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
