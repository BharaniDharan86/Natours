/* eslint-disable import/no-extraneous-dependencies */
const nodeMailer = require('nodemailer');

const sendMail = async (options) => {
  //1.create transporter
  // const transport = nodeMailer.createTransport({
  //   host: 'sandbox.smtp.mailtrap.io',
  //   port: 2525,
  //   auth: {
  //     user: '878f872d5ffc07',
  //     pass: '4b958bb9cd8674',
  //   },
  //   tls: { rejectUnauthorized: false },
  // });

  const transport = nodeMailer.createTransport({
    service: 'Brevo',
    // host: process.env.BREVO_HOST,
    // port: process.env.BREVO_PORT,
    auth: {
      user: process.env.BREVO_LOGIN,
      pass: process.env.BREVO_PASSWORD,
    },
  });

  //mail options

  const mailOptions = {
    from: 'bharanidharanm539@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //actually sent the mail

  return await transport.sendMail(mailOptions);
};

module.exports = sendMail;
