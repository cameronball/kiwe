const { getPostsWithin24Hours } = require('./24HourPosts.js');

getPostsWithin24Hours().then(posts => {
  console.log('Posts within the past 24 hours:');
  console.log(posts);
}).catch(error => {
  console.error('Error fetching posts:', error);
});
