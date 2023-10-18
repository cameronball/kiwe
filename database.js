const mongoose = require('mongoose');

class Database {

  constructor() {
    this.connect();
  }
  
  connect() {
    mongoose.connect('mongodb+srv://root:LziGFHUuCEveWaxI@twitterclonecluster.c5tzsqb.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.log('Failed to connect to MongoDB: ' + err);
    })
  }
}

module.exports = new Database();