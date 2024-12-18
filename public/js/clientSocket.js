// Init connect bool as false
var connected = false;

// Set the url to attempt server connections to
var socket = io("https://kiwe.social:443");
// Connect to the server
socket.emit("setup", userLoggedIn);

// Once server acknowledges user connection
socket.on("connected", () => connected = true);
// If a message is recieved, run the message recieved function.
socket.on("message received", (newMessage) => messageReceived(newMessage));

//If a notification is recieved
socket.on("notification received", () => {
  // Get the most recent notification
  $.get("/api/notifications/latest", (notificationData) => {
    // Show the notification pop and refresh the notification badges
	showNotificationPopup(notificationData);
	refreshNotificationsBadge();
  })
});

// Function to emit a notification
function emitNotification(userId) {
  // If the user id supplied matches current user, then halt execution
  if (userId == userLoggedIn._id) return;
  // Emit event that notification recieved
  socket.emit("notification received", userId);
}
