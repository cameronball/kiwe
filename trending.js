const mongoose = require('mongoose');
const cron = require('node-cron');
const fs = require('fs');

// Import Post model
const Post = require('./schemas/PostSchema');

// Function to update trending topics
async function updateTrendingTopics() {
  try {
    console.log('starting');
    // Get posts from the last hour
    const lastHour = new Date(Date.now() - 3600000);
    const posts = await Post.find({ createdAt: { $gte: lastHour } });
    console.log('found posts');
    // If no posts within the last hour, do not update trending topics
    if (posts.length === 0) {
      console.log('No new posts since the last check.');
      return;
    }

    // Extract words from posts and count occurrences
    const wordsCount = {};
    posts.forEach(post => {
      const words = post.content.split(/\s+/);
      words.forEach(word => {
        word = word.toLowerCase();
        if (wordsCount[word]) {
          wordsCount[word]++;
        } else {
          wordsCount[word] = 1;
        }
      });
    });

    // Sort words by count
    const sortedWords = Object.entries(wordsCount)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word)
      .slice(0, 5);

    // Save trending topics to JSON file
    fs.writeFileSync('trending.json', JSON.stringify(sortedWords, null, 2));
    console.log('Trending topics updated successfully:', sortedWords);
  } catch (err) {
    console.error('Error updating trending topics:', err);
  }
}

updateTrendingTopics();

// Schedule task to run every hour
cron.schedule('0 * * * *', updateTrendingTopics);
