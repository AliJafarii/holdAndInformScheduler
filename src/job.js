// job.js

const moment = require('moment');
const xlsx = require('xlsx');
const axios = require('axios');
const {
  fetchDataset,
  holdAmount,
  saveAdvocacy,
  sendEmail,
  config,
} = require('./services'); // hypothetical combined import

// Keep track of when we last sent an email.
// WARNING: This won't persist if the server/app restarts.
let lastEmailSentAt = null;

async function runJob() {
  console.log(`[${new Date().toISOString()}] Job started.`);

  // 1) Fetch dataset
  let dataset;
  try {
    dataset = await fetchDataset();
    console.log(`Retrieved ${dataset.rowCount} rows from Dataset API.`);
  } catch (error) {
    console.error('Error fetching dataset:', error.message);
    return;
  }

  const { rows, rowCount } = dataset;

  // Arrays for results
  const holdErrors = [];
  const advocacyErrors = [];
  const savedAdvocacies = [];

  // 2) Process each row
  for (const row of rows) {
    const [cif, nid, mobile, displayName, boxId, boxAccount, mainAccountId, mainAccountNo, mainAccountIban] = row;

    try {
      // 2a) Attempt hold
      await holdAmount(boxId, mainAccountNo);

      // 2b) If hold success, call saveAdvocacy
      await saveAdvocacy({
        nid,
        mobile,
        mainAccountNo,
        mainAccountIban,
        transactionAmount: config.transactionAmount,
      });
      savedAdvocacies.push({
        accountNumber: mainAccountNo,
        nationalCode: nid,
        price: config.transactionAmount,
        dateTime: moment().toISOString(),
      });
    } catch (err) {
      if (err.message.includes('Hold amount API failed')) {
        console.error(`Error holding amount for account ${mainAccountNo}: ${err.message}`);
        holdErrors.push({
          nid,
          mainAccountNo,
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      } else if (err.message.includes('Save advocacy API failed')) {
        console.error(`Error saving advocacy for account ${mainAccountNo}: ${err.message}`);
        advocacyErrors.push({
          mainAccountNo,
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      } else {
        console.error(`Unexpected error for account ${mainAccountNo}: ${err.message}`);
        advocacyErrors.push({
          mainAccountNo,
          error: err.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // 3) Check if we need to send error notification
  if (holdErrors.length > 0 || advocacyErrors.length > 0 || savedAdvocacies.length !== rowCount) {
    try {
      await axios.post(
        config.errorNotificationApi,
        {
          types: ['SAMAN_SMS'],
          body: { templateName: 'Alerting' },
          title: 'Error Notification',
          receivers: [
            { keyType: 'MOBILE', key: '09128144518' },
            { keyType: 'MOBILE', key: '09121974831' },
            { keyType: 'MOBILE', key: '09357648085' },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: config.errorNotificationAuthToken,
          },
          timeout: 5000,
        }
      );
      console.log('Error notification sent.');
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError.message);
    }
  }

  // 4) Create Excel
  const workbook = xlsx.utils.book_new();

  if (savedAdvocacies.length > 0) {
    const savedSheet = xlsx.utils.json_to_sheet(savedAdvocacies);
    xlsx.utils.book_append_sheet(workbook, savedSheet, 'موفق');
  }

  if (holdErrors.length > 0) {
    const holdErrorSheet = xlsx.utils.json_to_sheet(holdErrors);
    xlsx.utils.book_append_sheet(workbook, holdErrorSheet, 'خطا در مسدودسازی');
  }

  if (advocacyErrors.length > 0) {
    const advocacyErrorSheet = xlsx.utils.json_to_sheet(advocacyErrors);
    xlsx.utils.book_append_sheet(workbook, advocacyErrorSheet, 'خطا در اعلام');
  }

  const filename = `report_${moment().format('YYYYMMDD_HHmm')}.xlsx`;
  xlsx.writeFile(workbook, filename);
  console.log('Excel file saved:', filename);

  // 5) Send email every 6 hours
  if (shouldSendEmail()) {
    await sendEmail(filename);
    // Update the last sent timestamp
    lastEmailSentAt = Date.now();
    console.log('Email sent successfully. Next email will be sent after 6 hours.');
  } else {
    console.log(`It's not been 6 hours since last email. Skipping email.`);
  }

  console.log('Job finished successfully.');
}

function shouldSendEmail() {
  // If we've never sent an email, return true
  if (!lastEmailSentAt) {
    return true;
  }

  // Check how many hours have passed
  const hoursSinceLast = (Date.now() - lastEmailSentAt) / (1000 * 60 * 60);

  // Return true if 6 or more hours have passed
  return hoursSinceLast >= 6;
}

module.exports = {
  runJob,
};