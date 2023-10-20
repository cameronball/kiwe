const express = require('express');
const app = express();
const port = 80;
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require("body-parser")
const mongoose = require("./database");
const session = require('express-session');
const sha512 = require('js-sha512').sha512;

const server = app.listen(port, () => console.log("Server listening on port " + port));
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

// Api routes
const postApiRoute = require('./routes/api/posts');
const usersApiRoute = require('./routes/api/users');
const chatsApiRoute = require('./routes/api/chats');
const messagesApiRoute = require('./routes/api/messages');

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/api/posts", postApiRoute);
app.use("/api/users", usersApiRoute);
app.use("/api/chats", chatsApiRoute);
app.use("/api/messages", messagesApiRoute);
app.use("/post", middleware.requireLogin, postRoute);
app.use("/profile", middleware.requireLogin, profileRoute);
app.use("/uploads", uploadRoute);
app.use("/search", middleware.requireLogin, searchRoute);
app.use("/messages", middleware.requireLogin, messagesRoute);


app.get("/", middleware.requireLogin, (req, res, next) => {

  var payload = {
      pageTitle: "Home",
      userLoggedIn: req.session.user,
      userLoggedInJs: JSON.stringify(req.session.user)
  }

  res.status(200).render("home", payload);
})

io.on("connection", (socket) => {

  socket.on("setup", userData => {
    socket.join(sha512(userData._id));
    socket.emit("connected");
  })

  socket.on("join room", room => socket.join(room));
  socket.on("typing", room => socket.in(room).emit("typing"));
  socket.on("stop typing", room => socket.in(room).emit("stop typing"));

});