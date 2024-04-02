const { getPostsWithin24Hours } = require('./24HourPosts');

async function main() {
  let posts;
  try {
    posts = await getPostsWithin24Hours();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return;
  }
  
  console.log('Posts within the past 24 hours:');
  console.log(posts);
}

main();
