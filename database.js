const mongoose = require('mongoose');

require('dotenv').config();

class Database {

  constructor() {
    this.connect();
  }
  
  connect() {
    console.log(process.env.MONGODB);
    mongoose.connect(process.env.MONGODB)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.log('Failed to connect to MongoDB: ' + err);
    })
  }
}

module.exports = new Database();
