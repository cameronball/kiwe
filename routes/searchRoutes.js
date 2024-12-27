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

// Route to render the search page
router.get("/", (req, res, next) => {
    // Create a payload object
	var payload = createPayload(req.session.user);
    // Set the selected tab to posts
	payload.selectedTab = "posts";
    // Render the search page with the payload
  	res.status(200).render("searchPage", payload);
})

// Route to render the search page with a specific search term
router.get("/query/:searchTerm", (req, res, next) => {
    // Create a payload object
	var payload = createPayload(req.session.user);
    // Log the search term
	console.log(req.params.searchTerm);
    // Set the selected tab to posts
	payload.selectedTab = "posts";
    // Add the search term to the payload
	payload.searchTerm = req.params.searchTerm;
    // Render the search page with the payload
  	res.status(200).render("searchPage", payload);
})

// Route to render the search page with a specific tab selected
router.get("/tab/:selectedTab", (req, res, next) => {
    // Create a payload object
	var payload = createPayload(req.session.user);
    // Set the selected tab
	payload.selectedTab = req.params.selectedTab;
    // Render the search page with the payload
  	res.status(200).render("searchPage", payload);
})

// Function to create a payload object
function createPayload(userLoggedIn){
    // Return a payload object with the page title, user logged in, and user logged in as a JSON string
	return {
		pageTitle: "Search",
		userLoggedIn: userLoggedIn,
		userLoggedInJs: JSON.stringify(userLoggedIn)
	}
}

// Export the router
module.exports = router;
