var connected = false;

var socket = io("http://localhost:80");
socket.emit("setup", userLoggedIn);

socket.on("connected", () => connected = true);
socket.on("message received", (newMessage) => messageReceived(newMessage));

socket.on("notification received", () => {
  console.log("notification received");
  refreshNotificationsBadge();
});

function emitNotification(userId) {
  if (userId == userLoggedIn._id) return;
  socket.emit("notification received", userId);
}