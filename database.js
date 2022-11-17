const mongoose = require('mongoose');

class Database {

  constructor() {
    this.connect();
  }
  
  connect() {
    mongoose.connect('mongodb+srv://root:eR4XD3OSYyxth2rn@twitterclonecluster.tegdn4r.mongodb.net/TwitterCloneDB?retryWrites=true&w=majority')
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.log('Failed to connect to MongoDB: ' + err);
    })
  }
}

module.exports = new Database();