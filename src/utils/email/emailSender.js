const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

/**
 * Sends an email using nodemailer.
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient email address.
 * @param {string} [options.cc] - CC email addresses.
 * @param {string} [options.bcc] - BCC email addresses.
 * @param {string} options.subject - Email subject.
 * @param {string} [options.text] - Plain text content of the email.
 * @param {string} [options.html] - HTML content of the email.
 * @param {string} [options.template] - Path to the EJS template file.
 * @param {Object} [options.templateData] - Data to populate the EJS template.
 */
const sendEmail = async ({ to, cc, bcc, subject, text, html, template, templateData }) => {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, // SMTP username
                pass: process.env.SMTP_PASS, // SMTP password
            },
        });

        // Render the template if provided
        if (template) {
            const templatePath = path.join(__dirname, 'templates', template);
            html = await ejs.renderFile(templatePath, templateData || {});
        }

        // Define email options
        const mailOptions = {
            from: process.env.SMTP_FROM, // Sender address
            to,
            cc,
            bcc,
            subject,
            text,
            html,
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;