const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const requestIp = require('request-ip');
const os = require('os');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const archiver = require('archiver'); // npm install archiver

const { initializeDatabases } = require('./verbalPilotCore/models');
const scanAndMountRoutes = require('./verbalPilotCore/src/utils/routeScanner');
const sendResponse = require('./verbalPilotCore/src/utils/responseHandler');
const logger = require('./verbalPilotCore/src/utils/logger');

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
    max: parseInt(process.env.RATE_LIMIT || 100)  // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request parsing and basic middleware
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// Fix: Remove typo in allowed origins and handle OPTIONS requests for CORS
const allowedOrigins = [
  'https://verbalpilot.com',
  'https://www.verbalpilot.com',
  'https://pre-release.verbalpilot.com',
  'http://localhost:3000',
  'http://localhost:8080', // fixed typo: was 'htt://localhost:8080'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.get('/', (req, res) => {
    const debugInfo = {
        status: 'running',
        timestamp: new Date(),
        nodeVersion: process.version,
        platform: os.platform(),
        cpuCores: os.cpus().length,
        memoryUsageMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
        uptimeSeconds: process.uptime().toFixed(0),
        environment: process.env.NODE_ENV || 'development'
    };
    res.json(debugInfo);
});

app.get('/health', (req, res) => {
    if (req.query.logs === 'true') {
        // Append full relative path from index.js to logs folder
        const logsFolderPath = path.join(__dirname, 'verbalPilotCore', 'logs');

        if (fs.existsSync(logsFolderPath)) {
            res.setHeader('Content-Disposition', 'attachment; filename=logs.zip');
            res.setHeader('Content-Type', 'application/zip');

            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.on('error', (err) => res.status(500).send({ error: err.message }));

            archive.pipe(res);
            archive.directory(logsFolderPath, false);
            archive.finalize();
        } else {
            res.status(404).send('Logs folder not found');
        }
    } else {
        sendResponse(res, 200, true, { status: 'healthy' }, null);
    }
});


// Dynamically scan and mount routes
const routesDir = path.join(__dirname, 'verbalPilotCore', 'src', 'routes');
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
        await initializeDatabases();
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
