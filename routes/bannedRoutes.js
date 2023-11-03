const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const User = require('../schemas/UserSchema');

app.set("view engine", "pug");
app.set("views", "views");

router.get("/", (req, res, next) => {
	var payload = createPayload(req.session.user, "Banned");
	payload.selectedTab = "banned";
  res.status(200).render("banPage", payload);
});

function createPayload(userLoggedIn, title){
	return {
		pageTitle: title,
		userLoggedIn: userLoggedIn,
		userLoggedInJs: JSON.stringify(userLoggedIn)
	}
}


module.exports = router;
