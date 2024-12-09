// Neccessary imports
require('dotenv').config();
const mongoose = require('mongoose');
const moment = require('moment');

// Import the post schema file
const Post = require('./schemas/PostSchema');

// Connect to the DB
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a new function to get all of the posts within the past 24 hours
async function getPostsWithin24Hours() {
  try {
    // Get the unix timestamp from 24 hours ago
    const twentyFourHoursAgo = moment().subtract(24, 'hours');
    // Find posts where the createdAt timestamp is greater than or equal to the previously generated unix timestamp, as this means that they were created more recently than 24 hours ago and should be returned by this function.
    const posts = await Post.find({ createdAt: { $gte: twentyFourHoursAgo } }).exec();
    return posts;
    // Catch any errors
  } catch (error) {
    throw error;
  }
}

// Export the function so that other files can utilise it.
module.exports = { getPostsWithin24Hours };
