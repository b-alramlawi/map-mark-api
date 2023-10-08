// config/mail.js
module.exports = {
    service: 'gmail', // Email service provider
    auth: {
        user: process.env.GMAIL_EMAIL, // Email address
        pass: process.env.GMAIL_PASSWORD, // Email password
    },
};

