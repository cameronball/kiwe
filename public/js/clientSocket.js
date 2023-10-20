var connected = false;

var socket = io("http://localhost:80");
socket.emit("setup", userLoggedIn);

socket.on("connected", () => connected = true);