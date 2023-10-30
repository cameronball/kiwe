const mongoose = require('mongoose');

class Database {

  constructor() {
    this.connect();
  }
  
  connect() {
    mongoose.connect('')
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.log('Failed to connect to MongoDB: ' + err);
    })
  }
}

module.exports = new Database();
