// Import necessary package
const mongoose = require('mongoose');

// Require .env secret file
require('dotenv').config();

// Create the database class
class Database {

  // On creation, connect to the database
  constructor() {
    this.connect();
  }

  // Connect method
  connect() {
    // Connect to the database using the secret string
    mongoose.connect(process.env.MONGODB)
    .then(() => {
      // If successful, log as such
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      // If there is an error, log it
      console.log('Failed to connect to MongoDB: ' + err);
    })
  }
}

// Create a new object of the database class
module.exports = new Database();
