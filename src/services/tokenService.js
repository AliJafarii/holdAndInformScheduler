// src/services/tokenService.js
const axios = require('axios');
const config = require('../config');

async function fetchAccessToken() {
  try {
    const response = await axios.post(
      config.tokenApi,
      { userID: config.userID, userPWD: config.userPWD },
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.data && response.data.result) {
      config.accessToken = response.data.result.accessToken;
      // Optionally store in process.env
      process.env.ACCESS_TOKEN = config.accessToken;
      console.log(`Access token fetched:'\n ${config.accessToken}`);
    } else {
      throw new Error('Token API response is missing the expected result');
    }
  } catch (error) {
    console.error('Error fetching access token:', error.message);
  }
}

module.exports = {
  fetchAccessToken,
};