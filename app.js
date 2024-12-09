// Import necessary packages
const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require("body-parser")
const session = require('express-session');
const sha512 = require('js-sha512').sha512;

// Import packages made by myself
// Middleware package is what handle logic that needs to be ran before a request is routed, ie checking if user needs to be logged in or needs to be an admin before accessing a route.
const middleware = require('./middleware');
const mongoose = require("./database");

// Set the port for the main HTTPS server - it is port 443 as this is the standard for HTTPS servers
const port = 443;

// Set the paths to key and certificates for SSL auth.
const sslKeyPath = './kiwi.social.key';
const sslCertPath = './kiwi.social.pem';

// Log a message to console noting when the app is ran
var datetime = new Date();
console.log("app.js started at: " + datetime);

// Create http server to ensure users to use secure connection
const httpApp = express();
const http = require('http');

// If the user requests a site over HTTP, redirect them to the HTTPS version.
httpApp.get("*", function(req, res, next) {
    res.redirect("https://" + req.headers.host + req.path);
});

// Log once the HTTP server has been created on port 80 (the standard port for HTTP)
http.createServer(httpApp).listen(80, function() {
    console.log("HTTP redirect server listening on port 80");
});

// Set the options for the HTTPS server
const options = {
  key: fs.readFileSync('private.key.pem'), // Read the private key file
  cert: fs.readFileSync('domain.cert.pem'), // Read the domain certificate file
  ca: [
    fs.readFileSync('intermediate.cert.pem') // Read the intermediate certificate file
    // Add more intermediate certificates if there are any
  ],
  maxHeaderSize: 2 * 1024 * 1024 // Set maximum header size to 2 MB (allows for image uploads)
};

// Create the HTTPS server
const server = https.createServer(options, app);

// Instruct the server to listen on the port specified previously.
server.listen(port, () => {
  // Log a message to the console once the server is successfully listening.
  console.log(`Server listening on port ${port}`);
});

// Import and create a socket.io server which is used for real time communication between client and server, such as for real time messaging and notifications.
const io = require('socket.io')(server, { pingTimeout: 60000 });

// Set the app to use pug as the template engine
app.set("view engine", "pug");
// Set the views directory to be /views
app.set("views", "views");

// Use bodyParser for url encode/decode
app.use(bodyParser.urlencoded({ extended: false }));
// Serve the /public directory as a static directory
app.use(express.static(path.join(__dirname, "public")));

// Setup the app to use sessions, used for user authentication and tracking
app.use(session({
  // Set the secret to a random long very difficult string to guess - used an old news headline.
  secret: "17/11/2022 BBC News: 'I haven't ducked difficult decisions, chancellor tells BBC'",
  resave: true,
  saveUninitialized: false
}))

// Routes - import the routing files for the respective routes.
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');
const postRoute = require('./routes/postRoutes');
const profileRoute = require('./routes/profileRoutes');
const uploadRoute = require('./routes/uploadRoutes');
const searchRoute = require('./routes/searchRoutes');
const messagesRoute = require('./routes/messagesRoutes');
const notificationsRoute = require('./routes/notificationRoutes');
const settingsRoute = require('./routes/settingsRoutes');
const legalRoute = require('./routes/legalRoutes');
const adminRoute = require('./routes/adminRoutes');
const sslRoute = require('./routes/sslRoutes');
const banRoute = require('./routes/bannedRoutes');
const twoFactorRoute = require('./routes/twoFactorRoutes');
const tokensRoute = require('./routes/tokensRoutes');
const bookmarksRoute = require('./routes/bookmarksRoutes');

// Api routes - import the routing files for the respective api routes.
const postApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages');
const notificationsApiRoute = require('./routes/api/notifications');
const settingsApiRoute = require('./routes/api/settings');
const adminApiRoute = require('./routes/api/admin');
const twoFactorApiRoute = require('./routes/api/twoFactor');
const bookmarksApiRoute = require('./routes/api/bookmarks');

// Tell the app to use and serve all of the routes.
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/post", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/uploads", uploadRoute);
app.use("/search", middleware.requireLogin, searchRoute);
app.use("/messages", middleware.requireLogin, messagesRoute);
app.use("/notifications", middleware.requireLogin, notificationsRoute);
app.use("/settings", middleware.requireLogin, settingsRoute);
app.use("/twofactor", twoFactorRoute);
app.use("/legal", legalRoute);
app.use("/admin", middleware.requireAdmin, adminRoute);
app.use("/.well-known", sslRoute);
app.use("/banned", banRoute);
app.use("/tokens", tokensRoute);
app.use("/bookmarks", bookmarksRoute);

// Tell the app to use and serve all of the api routes.
app.use("/api/posts", postApiRoute);
app.use("/api/users", usersApiRoute);
app.use("/api/chats", chatsApiRoute);
app.use("/api/messages", messagesApiRoute);
app.use("/api/notifications", notificationsApiRoute);
app.use("/api/settings", settingsApiRoute);
app.use("/api/twofactor", twoFactorApiRoute);
app.use("/api/admin", adminApiRoute);
app.use("/api/bookmarks", bookmarksApiRoute);

// Serve the main home page - requiring login using the middleware file
app.get("/", middleware.requireLogin, (req, res, next) => {

  // Create the payload to serve to the user
  var payload = {
      // Set the page's title
      pageTitle: "Home",
      // Pass the requesting user's session information in the userLoggedIn variable
      userLoggedIn: req.session.user,
      // Pass the same information in JSON form.
      userLoggedInJs: JSON.stringify(req.session.user)
  }

  // Send a 200 success status code and render the home view and pass the payload
  res.status(200).render("home", payload);
})

// Serve the trending home page.
app.get("/home/trending", middleware.requireLogin, (req, res, next) => {

  var payload = {
      pageTitle: "Trending",
      userLoggedIn: req.session.user,
      userLoggedInJs: JSON.stringify(req.session.user)
  }

  res.status(200).render("trending", payload);
})

// If there is a 404, just redirect the user to the home page
app.use((req, res) => {
  res.redirect('/');
});

// Setup the socket.io server
io.on("connection", (socket) => {

  // Emit an event to connected users when a new user connects to the socket.io server
  socket.on("setup", userData => {
    socket.join(userData._id);
    socket.emit("connected");
  })

  // Handle events sent from the user
  // When user joins a room, add them to the room
  socket.on("join room", room => socket.join(room));
  // When a user starts typing, send that event to the other users in the room.
  socket.on("typing", room => socket.in(room).emit("typing"));
  // Do the same if the user stops typing.
  socket.on("stop typing", room => socket.in(room).emit("stop typing"));
  // Send an event if notification recieved for a user.
  socket.on("notification received", room => socket.in(room).emit("notification received"));

  // If a user sends a message
  socket.on("new message", newMessage => {
    // Get the ID of the chat that the new message was sent in
    var chat = newMessage.chat;

    // If the chat has no users, something has gone wrong and we should log this and end execution of the function.
    if(!chat.users) return console.log("Chat.users undefined");

    // For every user in the chat
    chat.users.forEach(user => {
      // If the user is the user that sent the message, we don't need to send the new message to them.
      if(user._id == newMessage.sender._id) return;
      // Send the new message event to the user
      socket.in(user._id).emit("message received", newMessage);
    })
  })

});
