const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const User = require('../schemas/UserSchema');

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res, next) => {
	var payload = createPayload(req.session.user);
	payload.selectedTab = "posts";
  	res.status(200).render("settingsPage", payload);
})

function createPayload(userLoggedIn){
	return {
		pageTitle: "Settings",
		userLoggedIn: userLoggedIn,
		userLoggedInJs: JSON.stringify(userLoggedIn)
	}
}


module.exports = router;