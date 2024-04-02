const { getPostsWithin24Hours } = require('./getPostsWithin24HoursFunction');

async function main() {
  try {
    const posts = await getPostsWithin24Hours();
    console.log('Posts within the past 24 hours:');
    console.log(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

main();
