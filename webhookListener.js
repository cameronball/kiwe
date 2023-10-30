const express = require('express');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

app.post('/webhook', (req, res) => {
	
  console.log('Deployment script started');
  const deploy = spawn('sh', ['./deployment.sh']);

  deploy.on('close', (code) => {
    console.log(`Deployment script exited with code ${code}`);
  });

  res.status(200).send('Deployment started');
});

app.listen(port, () => {
  console.log(`Webhook listener is running on port ${port}`);
});
