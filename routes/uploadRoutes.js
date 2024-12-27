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

// Route to serve images from the uploads/images directory
router.get("/images/:path", (req, res, next) => {
    // Sanitize the path parameter to prevent directory traversal
	sanatizedPath = req.params.path.replace(/[&\/\\#, +()$~%'":*?<>{}]/g, '');
    // Send the file from the uploads/images directory
	res.sendFile(path.join(__dirname, `../uploads/images/${sanatizedPath}`));
})

// Export the router
module.exports = router;
