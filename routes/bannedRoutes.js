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

// Route to render the ban page
router.get("/", (req, res, next) => {
    // Create a payload object
	var payload = createPayload(req.session.user, "Banned");
    // Set the selected tab to banned
	payload.selectedTab = "banned";
    // Render the ban page with the payload
  	res.status(200).render("banPage", payload);
});

// Function to create a payload object
function createPayload(userLoggedIn, title){
    // Return a payload object with the page title, user logged in, and user logged in as a JSON string
	return {
		pageTitle: title,
		userLoggedIn: userLoggedIn,
		userLoggedInJs: JSON.stringify(userLoggedIn)
	}
}

// Export the router
module.exports = router;
