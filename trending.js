const { getPostsWithin24Hours } = require('./24HourPosts');

async function main() {
  try {
    const posts = await getPostsWithin24Hours();
    console.log('Hashtags within the posts from the past 24 hours:');
    posts.forEach(post => {
      const hashtags = extractHashtags(post.content);
      if (hashtags.length > 0) {
        console.log(`Post ID: ${post._id}, Hashtags: ${hashtags.join(', ')}`);
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

// Function to extract hashtags from post content
function extractHashtags(content) {
  const regex = /%23([^']+)/g; // Regex to match hashtags starting with %23 and ending before '
  const matches = content.match(regex);
  if (matches) {
    return matches.map(match => match.substring(4)); // Extracting the word after %23
  }
  return [];
}

main();
