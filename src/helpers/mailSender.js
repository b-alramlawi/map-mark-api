// helpers/mailSender.js
const nodemailer = require('nodemailer');
const mailConfig = require('../config/mail');

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport(mailConfig);

        const mailOptions = {
            from: mailConfig.auth.user,
            to,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    sendEmail,
};
