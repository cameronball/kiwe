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

// Route to request a two-factor authentication secret
router.get("/requestSecret", async (req, res, next) => {
    // Generate a secret key
	var secretObject = speakeasy.generateSecret({length: 20});
    // Get the base32 encoded secret key
	var secretKey = secretObject.base32;
    // Initialize the URL variable
	var url = "";
	
    // Generate a QR code from the secret key
	QRCode.toDataURL(secretObject.otpauth_url, function(err, data_url) {
        // If there is an error, log it and return a 500 error
		if (err) {
			console.error(err);
			return res.sendStatus(500);
	    	} else {
            // Set the URL to the QR code data URL
			url = data_url;
            // Create a secrets object
			var secrets = {
				secretKey,
				url,
			};
		
            // Return the secrets object
			return res.status(200).send(secrets);
	    	}
	});
});

// Route to validate a two-factor authentication code
router.post("/validate", async (req, res, next) => {
    // If the two-factor code or secret key are not provided, return a 400 error
	if(!req.body.twoFactorCode || !req.body.totpSecretKey) {
		return res.sendStatus(400);	
	}
	else {
        // Get the two-factor code and secret key from the request body
		var givenCode = req.body.twoFactorCode;
		var secretKey = req.body.totpSecretKey;
	}

    // Get the username from the session
	var username = req.session.user.username;

    // Find the user with the given username
	var user = await User.findOne({ username: username });

    // If no user is found, return a 404 error
	if (user==null) {
		return res.sendStatus(404);
	}
	else {
        // Verify the two-factor code
		var verified = speakeasy.totp.verify({ secret: secretKey,
                                       encoding: 'base32',
                                       token: givenCode });
        // If the code is valid
		if (verified) {
            // Try to update the user's two-factor secret and enable two-factor authentication
			try {
                // Update the user's two-factor secret
				var twoFactorUpdate = User.findByIdAndUpdate(
					req.session.user._id,
					{ twoFactorSecret: secretKey },
					{ new: true }
				);

                // Enable two-factor authentication
				var twoFactorEnable = User.findByIdAndUpdate(
					req.session.user._id,
					{ twoFactorEnabled: true },
					{ new: true }
				);
	
                // Wait for both updates to complete
				var [updatedUser, _] = await Promise.all([
					twoFactorUpdate,
					twoFactorEnable,
				]);
				
                // Update the user in the session
				req.session.user = updatedUser;
	
                // Return a 200 status
				return res.sendStatus(200);
			} catch (error) {
                // Log any errors
				console.error(error);
                // Return a 500 error
				return res.sendStatus(500);
			}
		}
        // If the code is not valid, return a 403 error
		else {
			return res.sendStatus(403);
		}
	}
});

// Route to disable two-factor authentication
router.post("/disable", async (req, res, next) => {
    // Get the username from the session
	var username = req.session.user.username;

    // Find the user with the given username
	var user = await User.findOne({ username: username });

    // If no user is found, return a 404 error
	if (user==null) {
		return res.sendStatus(404);
	}
	else {
        // Try to disable two-factor authentication
		try {
            // Disable two-factor authentication
			var twoFactorDisable = User.findByIdAndUpdate(
				req.session.user._id,
				{ twoFactorEnabled: false },
				{ new: true }
			);

            // Wait for the update to complete
			var [updatedUser, _] = await Promise.all([
				twoFactorDisable,
			]);
			
            // Update the user in the session
			req.session.user = updatedUser;

            // Return a 200 status
			return res.sendStatus(200);
		} catch (error) {
            // Log any errors
			console.error(error);
            // Return a 500 error
			return res.sendStatus(500);
		}
	}
});

// Export the router
module.exports = router;
