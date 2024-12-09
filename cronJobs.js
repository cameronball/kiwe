// Import package allowing for creation of cron jobs
const cron = require('node-cron');
// Import pckage allowing for execution of system commands
const { exec } = require('child_process');

// Schedule a cron job to be ran every minute
cron.schedule('*/1 * * * *', () => {
    // Log that the cron job is being ran
    console.log('Running trending.js script...');

    // Run the trendings.js file
    const child = exec('node trending.js');

    // If data is returned, log it
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    // If an error is returned, log it as an error
    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    // Log when the process is finished with the exit code.
    child.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
    });
});
