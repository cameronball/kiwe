// Neccesary Imports
const fs = require('fs');
const path = require('path');

// Import the function allowing me to get all of the posts within the past 24 hours
const { getPostsWithin24Hours } = require('./24HourPosts');

// The main trending function
async function main() {
  try {
    // Run the function to get posts in the past 24h
    const posts = await getPostsWithin24Hours();

    // Run the function defined later in this file to get the frequency of hashtags in the posts.
    const hashtagsFrequency = extractHashtagsFrequency(posts);

    // Set the /public directory
    const publicDir = path.join(__dirname, 'public');

    // Set the file name
    const filePath = path.join(publicDir, 'hashtagsFrequency.json');

    // Stringify the JSON and then save it to the hashtags freqency file
    fs.writeFileSync(filePath, JSON.stringify(hashtagsFrequency, null, 2));

    // Log confirming it succeeded
    console.log('Hashtags frequency saved to file:', filePath);

    // End execution of the function
    process.exit()
  } catch (error) {
    // Log any errors
    console.error('Error fetching posts:', error);
  }
}

// Function to take posts and extract the frequencies of the hashtags contained within their contents
function extractHashtagsFrequency(posts) {
  // Initialise the hashtagsFrequency array which starts empty
  const hashtagsFrequency = {};
  // Iterate through every post
  posts.forEach(post => {
    // Check the post contains text content
    if (post.content) {
      // Use the extract hashtags function defined later in the file to get the hashtags in this particular post
      const hashtags = extractHashtags(post.content);
      // Iterate through every hashtag in the post
      hashtags.forEach(hashtag => {
        // Check that the current hashtag has text
        if (hashtagsFrequency.hasOwnProperty(hashtag)) {
          // Increment the count for this hashtag
          hashtagsFrequency[hashtag]++;
        } else {
          // Add this hashtag to the hashtagsFrequency array as a new key
          hashtagsFrequency[hashtag] = 1;
        }
      });
    }
  });
  // Sort the hashtagsFrequency array based on the frequency descending
  const sortedHashtagsFrequency = Object.fromEntries(
    Object.entries(hashtagsFrequency).sort(([,a],[,b]) => b - a)
  );

  // Return the sorted final list
  return sortedHashtagsFrequency;
}

// Function that takes a piece of text and parses out all of the hashtags contained
function extractHashtags(content) {
  // Regex to match hashtags starting with %23 (#) and ending before '
  const regex = /%23([^']+)/g;
  // Array containing matches for the regex
  const matches = content.match(regex);
  // If there are hashtags found
  if (matches) {
    // Extracting the word after %23 (the hashtag content) then return it
    return matches.map(match => match.substring(3)); 
  }
  // If no matches return an empty array
  return [];
}


// When the file is ran, run the main function
main();
