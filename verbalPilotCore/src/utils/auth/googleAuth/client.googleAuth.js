const { OAuth2Client } = require("google-auth-library");

console.log(`Secret: ${process.env.GOOGLE_CLIENT_SECRET}, Client ID: ${process.env.GOOGLE_CLIENT_ID}, Redirect URI: ${process.env.GOOGLE_REDIRECT_URI} `);

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

module.exports = {
    googleClient
};