const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require("body-parser")
const bcrypt = require('bcrypt'); 
const path = require('path');
const User = require('../schemas/UserSchema');

// Set the view engine to pug
app.set("view engine", "pug");
// Set the views directory
app.set("views", "views");

// Route to serve files from the .well-known directory
router.get("/:path", (req, res, next) => {
    // Sanitize the path parameter to prevent directory traversal
	sanatizedPath = req.params.path.replace(/[&\/\\#, +()$~%'":*?<>{}]/g, '');
    // Send the file from the .well-known directory
	res.sendFile(path.join(__dirname, `../.well-known/${sanatizedPath}`));
})

// Export the router
module.exports = router;
