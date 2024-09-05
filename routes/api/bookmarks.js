const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const sanitizer = require('sanitizer');
const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Notification = require('../../schemas/NotificationSchema');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.urlencoded({ extended: false }));

module.exports = router;
