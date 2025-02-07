// src/index.js
require('dotenv').config();
const cron = require('node-cron');
const { runJob } = require('./job');
const { fetchAccessToken } = require('./services/tokenService');

// 1) Fetch token initially
fetchAccessToken();

// 2) Schedule token refresh every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log(`[${new Date().toISOString()}] Token refresh job started.`);
  await fetchAccessToken();
});

// 3) Schedule the main job (e.g., every hour)
cron.schedule('* * * * *', async () => {
  await runJob();
});