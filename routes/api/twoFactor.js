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
	var url = "";

	QRCode.toDataURL(secretObject.otpauth_url, function(err, data_url) {
		if (err) {
			console.error(err);
			return res.sendStatus(500);
	    	} else {
			url = data_url;
			var secrets = {
				secretKey,
				url,
			};
		
			return res.status(200).send(secrets);
	    	}
	});
});

router.post("/validate", async (req, res, next) => {
	if(!req.query.twoFactorCode || !req.query.totpSecretKey) {
		return res.sendStatus(400);	
	}
	else {
		var givenCode = twoFactorCode;
		var secretKey = req.query.totpSecretKey;
	}

	var username = req.body.user.username;

	var user = await User.findOne({ username: username });

	if (user==null) {
		return res.sendStatus(404);
	}
	else {
		var verified = speakeasy.totp.verify({ secret: secretKey,
                                       encoding: 'base32',
                                       token: givenCode });
		if (verified) {
			return res.sendStatus(200);
		}
		else {
			return res.sendStatus(403);
		}
	}
});

module.exports = router;
