const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const sanitizer = require('sanitizer');
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");
const speakeasy = require("speakeasy");
const QRCode = require('qrcode');

const User = require('../../schemas/UserSchema');
const Post = require('../../schemas/PostSchema');
const Chat = require('../../schemas/ChatSchema');
const Message = require('../../schemas/MessageSchema');
const Notification = require('../../schemas/NotificationSchema');

var validator = require("email-validator");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/requestSecret", async (req, res, next) => {
	var secretObject = speakeasy.generateSecret({length: 20});
	var secretKey = secretObject.base32;

	QRCode.toDataURL(secretObject.otpauth_url, function(err, data_url) {
	  var url = data_url
	});

	var secrets = {
		secretKey,
		url,
	};

	return res.status(200).send(secrets);
});

module.exports = router;
