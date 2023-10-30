#!/bin/bash

# Replace with your repository URL
REPO_URL="https://github.com/cameronball/kiwe.git"
# Replace with your Node.js app entry file
APP_ENTRY="app.js"

# Pull the latest changes from the GitHub repository
git pull

# Install/update dependencies
npm install

# Restart the Node.js application
pm2 restart $APP_ENTRY
