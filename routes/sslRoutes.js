const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const path = require('path');
const User = require('../schemas/UserSchema');

app.set("view engine", "pug");
app.set("views", "views");

router.get("/:path", (req, res, next) => {
	sanatizedPath = req.params.path.replace(/[&\/\\#, +()$~%'":*?<>{}]/g, '');
	res.sendFile(path.join(__dirname, `../.well-known/${sanatizedPath}`));
})

module.exports = router;