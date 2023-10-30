var connected = false;
require('https').globalAgent.options.rejectUnauthorized = false;

var socket = io("https://kiwe.social:80");
socket.emit("setup", userLoggedIn);

socket.on("connected", () => connected = true);
socket.on("message received", (newMessage) => messageReceived(newMessage));

socket.on("notification received", () => {
  $.get("/api/notifications/latest", (notificationData) => {
	showNotificationPopup(notificationData);
	refreshNotificationsBadge();
  })
});

function emitNotification(userId) {
  if (userId == userLoggedIn._id) return;
  socket.emit("notification received", userId);
}