const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const User = require('../schemas/UserSchema');

// Set the view engine to pug
app.set("view engine", "pug");
// Set the views directory
app.set("views", "views");

// Route to render a specific post page
router.get("/:id", (req, res, next) => {
    // Create a payload object
	var payload = {
		pageTitle: "View post",
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
		postId: req.params.id // Add the post ID to the payload
	}
  
    // Render the post page with the payload
  	res.status(200).render("postPage", payload);
})

// Export the router
module.exports = router;
