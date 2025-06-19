require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabases } = require('./models');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/user', require('./routes/api/user'));

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: true,
        message: 'Internal server error',
        data: null
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    try {
        await initializeDatabases();
        logger.info(`Server is running on port ${PORT}`);
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}); 