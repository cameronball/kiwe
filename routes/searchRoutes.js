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
  	res.status(200).render("searchPage", payload);
})

router.get("/query/:searchTerm", (req, res, next) => {
	var payload = createPayload(req.session.user);
	console.log(req.params.searchTerm);
	payload.selectedTab = "posts";
	payload.searchTerm = req.params.searchTerm;
  	res.status(200).render("searchPage", payload);
})

router.get("/tab/:selectedTab", (req, res, next) => {
	var payload = createPayload(req.session.user);
	payload.selectedTab = req.params.selectedTab;
  	res.status(200).render("searchPage", payload);
})


function createPayload(userLoggedIn){
	return {
		pageTitle: "Search",
		userLoggedIn: userLoggedIn,
		userLoggedInJs: JSON.stringify(userLoggedIn)
	}
}

module.exports = router;