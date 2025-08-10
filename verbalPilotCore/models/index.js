const { Pool } = require('pg');
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

// PostgreSQL connection using pg
const pgPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : 5432,
  ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false
});


const pgQuery = (text, params) => pgPool.query(text, params);

// MongoDB connection
const connectMongo = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(mongoUri, options);
        logger.info('MongoDB connected successfully');

        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
};

// Import MongoDB models
const mongoModels = require('./mongoSchemas');

// Database initialization function
const initializeDatabases = async () => {
    try {
        // Test PostgreSQL connection
        await pgPool.query('SELECT 1');
        logger.info('PostgreSQL database connection established successfully');

        // Initialize MongoDB
        // await connectMongo();
        // logger.info('MongoDB connection established successfully');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
};

// Export all models and connections
module.exports = {
    pgPool,
    pgQuery,
    initializeDatabases,
    ...mongoModels
}; 