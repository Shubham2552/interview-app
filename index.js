const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const requestIp = require('request-ip');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const { initializeDatabase } = require('./interviewAppSource/src/models');
const scanAndMountRoutes = require('./interviewAppSource/src/utils/routeScanner');
const sendResponse = require('./interviewAppSource/src/utils/responseHandler');
const logger = require('./interviewAppSource/src/utils/logger');

require('module-alias/register');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());
app.set('trust proxy', 'loopback');

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request parsing and basic middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(requestIp.mw());

// Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
    sendResponse(res, 200, true, { status: 'healthy' }, null);
});

// Dynamically scan and mount routes
const routesDir = path.join(__dirname, 'interviewAppSource', 'src', 'routes');
scanAndMountRoutes(app, routesDir);

// 404 handler
app.use((req, res) => {
    sendResponse(res, 404, false, null, 'Route not found');
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error('Error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.clientIp
    });

    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? (status === 500 ? 'Internal Server Error' : err.message)
        : err.message;

    sendResponse(res, status, false, null, message);
});

// Database connection with retry mechanism
const connectWithRetry = async (retries = 5, delay = 5000) => {
    try {
        await initializeDatabase();
        logger.info('Database initialized successfully');
    } catch (err) {
        logger.error('Database initialization failed:', err);
        if (retries > 0) {
            logger.info(`Retrying connection in ${delay/1000} seconds... (${retries} attempts remaining)`);
            setTimeout(() => connectWithRetry(retries - 1, delay), delay);
        } else {
            logger.error('Max retries reached. Unable to connect to database.');
            process.exit(1);
        }
    }
};

// Start the server
app.listen(port, () => {
    logger.info(`Server is running on http://localhost:${port}`);
    connectWithRetry();
});
