const { Sequelize } = require('sequelize');

// Create a new Sequelize instance
const sequelize = new Sequelize('interview-app', 'postgres', 'Shubh@2525', {
    host: 'localhost', // Replace with your database host
    dialect: 'postgres', // Replace with your database dialect (e.g., 'mysql', 'postgres', 'sqlite', 'mssql')
    logging: false, // Disable logging; set to true for debugging
});

// Test the database connection

module.exports = sequelize;