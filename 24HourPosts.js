require('dotenv').config();
const mongoose = require('mongoose');
const moment = require('moment');
const Post = require('./schemas/PostSchema');

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function getPostsWithin24Hours() {
  try {
    const twentyFourHoursAgo = moment().subtract(24, 'hours');

    const posts = await Post.find({
      createdAt: { $gte: twentyFourHoursAgo },
    }).exec();

    console.log(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
  } finally {
    mongoose.disconnect();
  }
}

module.exports = { getPostsWithin24Hours };
