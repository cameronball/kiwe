// Import necessary packages
const express = require('express');

// Import ability to run the spawn command to spawn child processes.
const { spawn } = require('child_process');

// Create a new express app
const app = express();
// Set the port of this new server to 3000
const port = 3000;

// Setup a post route on /webhook
app.post('/webhook', (req, res) => {

  // Log that this has been triggered
  console.log('Deployment script started');
  // Run the deployment.sh script using bash
  const deploy = spawn('sh', ['./deployment.sh']);

  // Log the result
  deploy.on('close', (code) => {
    console.log(`Deployment script exited with code ${code}`);
  });

  // Send a success code
  res.status(200).send('Deployment started');
});

// Listen on the port specified
app.listen(port, () => {
  // Log that the server was started successfully.
  console.log(`Webhook listener is running on port ${port}`);
});
