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

// Route to render the current user's profile page
router.get("/", (req, res, next) => {
    // Create a payload object
	var payload = {
		pageTitle: "@"+req.session.user.username,
		userLoggedIn: req.session.user,
		userLoggedInJs: JSON.stringify(req.session.user),
		profileUser: req.session.user // Add the current user to the payload
	}
  
    // Render the profile page with the payload
  	res.status(200).render("profilePage", payload);
})

// Route to render a specific user's profile page
router.get("/:username", async (req, res, next) => {
    // Get the payload object for the user
	var payload = await getPayload(req.params.username, req.session.user);

    // If the payload is 404, return a 404 error
	if(payload==404) {
		res.sendStatus(404);
		return;
	}
	else{
        // Render the profile page with the payload
		res.status(200).render("profilePage", payload);
	}
})

// Route to render a specific user's profile page with the replies tab selected
router.get("/:username/replies", async (req, res, next) => {
    // Get the payload object for the user
	var payload = await getPayload(req.params.username, req.session.user);
	
    // If the payload is 404, return a 404 error
	if(payload==404) {
		res.sendStatus(404);
		return;
	}
	else{
        // Set the selected tab to replies
		payload.selectedTab = "replies";
        // Render the profile page with the payload
		res.status(200).render("profilePage", payload);
	}
})

// Route to render a specific user's profile page with the likes tab selected
router.get("/:username/likes", async (req, res, next) => {
    // Get the payload object for the user
	var payload = await getPayload(req.params.username, req.session.user);
	
    // If the payload is 404, return a 404 error
	if(payload==404) {
		res.sendStatus(404);
		return;
	}
	else{
        // Set the selected tab to likes
		payload.selectedTab = "likes";
        // Render the profile page with the payload
		res.status(200).render("profilePage", payload);
	}
})

// Route to render a specific user's profile page with the followers tab selected
router.get("/:username/followers", async (req, res, next) => {
    // Get the payload object for the user
	var payload = await getPayload(req.params.username, req.session.user);

    // If the payload is 404, return a 404 error
	if(payload==404) {
		res.sendStatus(404);
		return;
	}
	else{
        // Set the selected tab to followers
		payload.selectedTab = "followers";
        // Render the followers and following page with the payload
		res.status(200).render("followersAndFollowing", payload);
	}

})

// Route to render a specific user's profile page with the following tab selected
router.get("/:username/following", async (req, res, next) => {
    // Get the payload object for the user
	var payload = await getPayload(req.params.username, req.session.user);
	
    // If the payload is 404, return a 404 error
	if(payload==404) {
		res.sendStatus(404);
		return;
	}
	else{
        // Set the selected tab to following
		payload.selectedTab = "following";
        // Render the followers and following page with the payload
		res.status(200).render("followersAndFollowing", payload);
	}
})

// Function to get the payload object for a user
async function getPayload(username, userLoggedIn) {
    // Find the user with the given username
	var user = await User.findOne({ username: username})

    // Try to find the user, if the username is not valid, try to find by ID
	try {
        // If no user is found, try to find by ID
		if (user == null) {

			user = await User.findById(username)

            // If no user is found, return a payload object with a "User not found" message
			if (user == null) {
				return {
					pageTitle: "User not found",
					userLoggedIn: userLoggedIn,
					userLoggedInJs: JSON.stringify(userLoggedIn)
				}
			}
		}
	}
	catch {
        // If there is an error, return a 404 error
		return 404;
	}

    // Return a payload object with the user's information
	return {
		pageTitle: "@"+user.username,
		userLoggedIn: userLoggedIn,
		userLoggedInJs: JSON.stringify(userLoggedIn),
		profileUser: user
	}
}

// Export the router
module.exports = router;
