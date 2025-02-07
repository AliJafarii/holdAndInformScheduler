// holdService.js
const axios = require('axios');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const config = require('../config'); // or wherever your config is

async function holdAmount(boxId, mainAccountNo) {
  // 1) Generate requestNo
  const requestId = `manual_${uuidv4()}`;

  // 2) Construct hold URL
  const holdUrl = config.holdAmountApi.replace('{{savingID}}', boxId);

  // 3) Prepare the request body
  const holdRequestData = {
    transactionDate: moment().format('DD MMMM YYYY'),
    transactionAmount: config.transactionAmount,
    locale: 'en',
    dateFormat: 'dd MMMM yyyy',
  };

  // 4) Log the request for debugging
  console.log('--- holdAmount Request ---');
  console.log('URL:', holdUrl);
  console.log('Headers:', {
    'Content-Type': 'application/json',
    Cookie: config.holdCookie,
    'Fineract-Platform-TenantId': config.holdTenantId,
    'cache-control': 'no-cache',
    requestNo: requestId,
    // If you do NOT need "Bearer ", then do not prefix it
    Authorization: config.holdAccessToken,
  });
  console.log('Body:', holdRequestData);
  console.log('---------------------------------');

  try {
    const response = await axios.post(
      holdUrl,
      holdRequestData,
      {
        headers: {
          'Content-Type': 'application/json',
          Cookie: config.holdCookie,
          'Fineract-Platform-TenantId': config.holdTenantId,
          'cache-control': 'no-cache',
          requestNo: requestId,
          Authorization: config.holdAccessToken,
        },
        timeout: 10000,
      }
    );

    console.log('HoldAmount raw response:', response.data);

    if (response.status === 200) {
      // Instead of checking response.data.success, we check for resourceId (or referenceNumber)
      if (response.data && response.data.resourceId) {
        console.log(`HoldAmount succeeded for boxId ${boxId} (account ${mainAccountNo}). requestNo: ${requestId}`);
        return true; // Success
      } else {
        // The server returned 200 but didn't provide resourceId => treat as error
        const msg = response.data?.message || 'Unknown error from holdAmount API (no resourceId)';
        throw new Error(`Hold amount API failed: ${msg}`);
      }
    } else {
      throw new Error(`Hold amount API failed with status code ${response.status}`);
    }
  } catch (error) {
    if (error.response) {
      console.error('HoldAmount Error:', error.response.status, error.response.data);
    } else {
      console.error('HoldAmount Error (no response):', error.message);
    }
    throw new Error(`Hold amount API failed: ${error.message}`);
  }
}

module.exports = {
  holdAmount,
};