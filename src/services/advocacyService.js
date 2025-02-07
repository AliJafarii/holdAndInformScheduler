// src/services/advocacyService.js
const axios = require('axios');
const moment = require('moment');
const config = require('../config');

async function saveAdvocacy({
  nid,
  mobile,
  mainAccountNo,
  mainAccountIban,
  transactionAmount,
}) {
  // We'll do up to 30 retries
  let retryCount = 0;
  const maxRetries = 30;
  const retryDelay = 1000; // 1 second

  while (retryCount < maxRetries) {
    try {
      const response = await axios.post(
        config.saveAdvocacyApi,
        [
          {
            nationalcode: nid,
            bankName: '33',
            price: transactionAmount,
            dateTime: moment().toISOString(),
            accountNumber: mainAccountNo,
            shabaNumber: mainAccountIban,
            Mobile: mobile,
            status: 1,
          },
        ],
        {
          headers: { Authorization: `Bearer ${config.accessToken}` },
          timeout: 5000,
        }
      );

      if (response.status === 200 && response.data && response.data.success) {
        console.log(`Advocacy saved for account ${mainAccountNo}.`);
        return; // success
      } else {
        const errorMsg = response.data?.message || 'Unknown error from saveAdvocacy API';
        throw new Error(`Save advocacy API failed: ${errorMsg}`);
      }
    } catch (err) {
      retryCount++;
      console.error(`Advocacy API attempt ${retryCount} failed for account ${mainAccountNo}:`, err.message);
      if (retryCount >= maxRetries) {
        throw new Error(`Save advocacy API failed after ${maxRetries} attempts: ${err.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

module.exports = {
  saveAdvocacy,
};