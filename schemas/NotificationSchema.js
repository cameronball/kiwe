const mongoose = require('mongoose');

// Get the mongoose schema
const Schema = mongoose.Schema;

// Create a new schema for notifications
const NotificationSchema = new Schema({
    // The ID of the user who is receiving the notification, references the User model
	userTo : { type: Schema.Types.ObjectId, ref: "User" },
    // The ID of the user who sent the notification, references the User model
	userFrom : { type: Schema.Types.ObjectId, ref: "User" },
    // The type of notification
	notificationType : String,
    // Whether the notification has been opened, defaults to false
	opened : { type: Boolean, default: false },
    // The ID of the entity associated with the notification
	entityId : Schema.Types.ObjectId,
}, { timestamps: true }); // Add timestamps for creation and update

// Add a static method to the NotificationSchema to insert a new notification
NotificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId) => {
    // Create a data object with the notification details
	var data = {
		userTo: userTo,
		userFrom: userFrom,
		notificationType: notificationType,
		entityId: entityId
	};
    // Delete any existing notifications with the same data (to prevent duplicate notifications)
	await Notification.deleteOne(data).catch(error => console.log(error));
    // Create a new notification in the database
	return Notification.create(data).catch(error => console.log(error));
};

// Create the Notification model
var Notification = mongoose.model('Notification', NotificationSchema);
// Export the Notification model
module.exports = Notification;
