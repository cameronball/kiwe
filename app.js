const express = require('express');
const app = express();
const https = require('https');
const fs = require('fs');
const port = 80;
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require("body-parser")
const mongoose = require("./database");
const session = require('express-session');
const sha512 = require('js-sha512').sha512;

const sslKeyPath = './kiwi.social.key';
const sslCertPath = './kiwi.social.pem';

const options = {
  key: fs.readFileSync(sslKeyPath),   // Read your private key file
  cert: fs.readFileSync(sslCertPath), // Read your certificate file
};

// const server = https.createServer(options, app); // Create an HTTPS server

/*
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
*/

// Create http server
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


const io = require('socket.io')(server, { pingTimeout: 60000 });

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "17/11/2022 BBC News: 'I haven't ducked difficult decisions, chancellor tells BBC'",
  resave: true,
  saveUninitialized: false
}))

// Routes
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
const adminRoute = require('./routes/adminRoutes');
const sslRoute = require('./routes/sslRoutes');

// Api routes
const postApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages');
const notificationsApiRoute = require('./routes/api/notifications');
const settingsApiRoute = require('./routes/api/settings');
const adminApiRoute = require('./routes/api/admin');

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
app.use("/admin", middleware.requireAdmin, adminRoute);
app.use("/.well-known", sslRoute);

// Api routes
app.use("/api/posts", postApiRoute);
app.use("/api/users", usersApiRoute);
app.use("/api/chats", chatsApiRoute);
app.use("/api/messages", messagesApiRoute);
app.use("/api/notifications", notificationsApiRoute);
app.use("/api/settings", settingsApiRoute);
app.use("/api/admin", adminApiRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {

  var payload = {
      pageTitle: "Home",
      userLoggedIn: req.session.user,
      userLoggedInJs: JSON.stringify(req.session.user)
  }

  res.status(200).render("home", payload);
})

app.use((req, res) => {
  res.redirect('/');
});

io.on("connection", (socket) => {

  socket.on("setup", userData => {
    socket.join(userData._id);
    socket.emit("connected");
  })

  socket.on("join room", room => socket.join(room));
  socket.on("typing", room => socket.in(room).emit("typing"));
  socket.on("stop typing", room => socket.in(room).emit("stop typing"));
  socket.on("notification received", room => socket.in(room).emit("notification received"));

  socket.on("new message", newMessage => {
    var chat = newMessage.chat;

    if(!chat.users) return console.log("Chat.users undefined");

    chat.users.forEach(user => {
      if(user._id == newMessage.sender._id) return;
      socket.in(user._id).emit("message received", newMessage);
    })
  })

});