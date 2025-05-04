const express = require('express');
const sequelize = require('./src/dbConnections/sqlConnection');
const scanAndMountRoutes = require('./src/utils/routeScanner');
const sendResponse = require('./src/utils/responseHandler');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Dynamically scan and mount routes
const routesDir = path.join(__dirname, 'src', 'routes');
scanAndMountRoutes(app, routesDir);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler caught an error:', err);
    sendResponse(res, err.status || 500, false, null, err.message || 'Internal Server Error');
});

// Start the server
app.listen(port, () => {
    sequelize.authenticate()
        .then(() => {
            console.log('Database connection has been established successfully.');
            sequelize.sync({ alter: true }).then(() => {
                console.log('Database synchronized successfully with alter:true.');
            }).catch(err => {
                console.error('Error synchronizing the database:', err);
            });

        })
        .catch(err => {
            console.error('Unable to connect to the database:', err);
        });
    console.log(`Server is running on http://localhost:${port}`);
});