const fs = require('fs');
const path = require('path');
const { getPostsWithin24Hours } = require('./24HourPosts');

async function main() {
  try {
    const posts = await getPostsWithin24Hours();
    console.log('Hashtags within the posts from the past 24 hours:');
    const hashtagsFrequency = extractHashtagsFrequency(posts);
    console.log(hashtagsFrequency);

    const publicDir = path.join(__dirname, 'public');
    const filePath = path.join(publicDir, 'hashtagsFrequency.json');

    fs.writeFileSync(filePath, JSON.stringify(hashtagsFrequency, null, 2));
    console.log('Hashtags frequency saved to file:', filePath);
    process.exit()
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}


function extractHashtagsFrequency(posts) {
  const hashtagsFrequency = {};
  posts.forEach(post => {
    if (post.content) {
      const hashtags = extractHashtags(post.content);
      hashtags.forEach(hashtag => {
        if (hashtagsFrequency.hasOwnProperty(hashtag)) {
          hashtagsFrequency[hashtag]++;
        } else {
          hashtagsFrequency[hashtag] = 1;
        }
      });
    }
  });
  const sortedHashtagsFrequency = Object.fromEntries(
    Object.entries(hashtagsFrequency).sort(([,a],[,b]) => b - a)
  );

  return sortedHashtagsFrequency;
}

function extractHashtags(content) {
  const regex = /%23([^']+)/g; // Regex to match hashtags starting with %23 and ending before '
  const matches = content.match(regex);
  if (matches) {
    return matches.map(match => match.substring(3)); // Extracting the word after %23
  }
  return [];
}

main();
