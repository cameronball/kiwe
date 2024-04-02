const cron = require('node-cron');
const { exec } = require('child_process');

cron.schedule('*/1 * * * *', () => {
    console.log('Running trending.js script...');
    
    const child = exec('node trending.js');

    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
    });
});
