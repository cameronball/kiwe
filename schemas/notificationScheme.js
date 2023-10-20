const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
	userTo : { type: Schema.Types.ObjectId, ref: "User" },
	userFrom : { type: Schema.Types.ObjectId, ref: "User" },
	notificationType : String,
	opened : { type: Boolean, default: false },
	entityId : Schema.Types.ObjectId,
}, { timestamps: true });

var Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Post;