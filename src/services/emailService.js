// src/services/emailService.js
const nodemailer = require('nodemailer');
const config = require('../config');

async function sendEmail(filename) {
  try {
    const transporter = nodemailer.createTransport({
      host: config.emailConfig.host,
      port: config.emailConfig.port,
      secure: config.emailConfig.secure,
      auth: {
        user: config.emailConfig.auth.user,
        pass: config.emailConfig.auth.pass,
      },
    });

    await transporter.verify();
    console.log('Email transporter verified.');

    const info = await transporter.sendMail({
      from: config.emailFrom,
      to: config.emailTo,
      cc: config.emailCC,
      subject: 'Vekalati Report',
      text: 'باسلام و احترام\n\nفایل پیوست حاوی حساب های وکالتی شده هستند. در صورت بروز خطا، موارد در شیت مجزا اعلام شده است.\n\nارادتمند\nسیدعلی',
      html: '<p>باسلام و احترام<br><br>فایل پیوست حاوی حساب‌های وکالتی شده هستند. در صورت بروز خطا، موارد در شیت مجزا اعلام شده است.<br><br>ارادتمند<br>سیدعلی</p>',
      attachments: [
        {
          filename,
          path: `./${filename}`,
        },
      ],
    });

    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send email:', error.message);
  }
}

module.exports = {
  sendEmail,
};