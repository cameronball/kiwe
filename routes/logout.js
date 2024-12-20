const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const User = require('../schemas/UserSchema');

app.use(bodyParser.urlencoded({ extended: false }));

// Route to handle user logout
router.get("/", (req, res, next) => {
    // If a session exists
	if (req.session) {
        // Destroy the session
		req.session.destroy(() => {
            // Redirect the user to the login page
			res.redirect("/login");	
		});
  	}
})

// Export the router
module.exports = router;
