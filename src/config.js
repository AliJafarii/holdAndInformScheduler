// src/config.js
require('dotenv').config(); // Load .env as soon as possible

module.exports = {
  // APIs
  tokenApi: 'https://service.ikcosales.ir/api/TokenAuth/Auth/Auth',
  datasetApi: 'https://insights.blubank.com/api/dataset',
  errorNotificationApi: 'https://pushservice-prod.sdb247.com/requestpublisher/v2/requests',
  holdAmountApi: 'https://prod.sdb247.com/core/fineract-provider/api/v1/savingsaccounts/{{savingID}}/transactions?command=holdAmount',
  saveAdvocacyApi: 'https://service.ikcosales.ir/api/services/app/Bank/SaveAdvocacyUsersFromBank',
  inquiryAdvocacyApi: 'https://service.ikcosales.ir/api/services/app/Bank/InquiryAdvocacyUsersFromBank',

  // Env / Credentials
  userID: process.env.USER_ID || '',
  userPWD: process.env.USER_PWD || '',
  dataset_cookie: process.env.COOKIE || 'your_cookie_here',

  // Tokens & Cookies
  holdAccessToken: process.env.HOLD_ACCESS_TOKEN || '',
  holdCookie: process.env.HOLD_COOKIE || 'JSESSIONID=...; JSESSIONID=...',
  holdTenantId: process.env.HOLD_TENANT_ID || 'default',
  errorNotificationAuthToken: process.env.ERROR_NOTIFICATION_AUTH_TOKEN || '',

  // Transaction amount
  transactionAmount: 3000000000,

  // Email
  emailConfig: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your_smtp_username',
      pass: process.env.SMTP_PASS || 'your_smtp_password',
    },
  },
  emailFrom: process.env.EMAIL_FROM || '"Default Sender" <sender@example.com>',
  emailTo: process.env.EMAIL_TO ? process.env.EMAIL_TO.split(',') : ['recipient@example.com'],
  emailCC: process.env.EMAIL_CC ? process.env.EMAIL_CC.split(',') : [],

  // Access Token (initially empty, will be set by token service)
  accessToken: process.env.ACCESS_TOKEN || '',
};
