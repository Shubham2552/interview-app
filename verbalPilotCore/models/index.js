const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

// Sequelize connection
const sequelize = new Sequelize(
    process.env.POSTGRES_DB,
    process.env.POSTGRES_USER,
    process.env.POSTGRES_PASSWORD,
    {
        host: process.env.POSTGRES_HOST,
        dialect: process.env.POSTGRES_DIALECT,
        logging: (msg) => logger.debug(msg),
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

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

// Import Sequelize models
const sequelizeModels = {
    PreRegisterUser: require('./sequelizeSchemas/preRegisterUser')(sequelize),
    PreRegisterPersonalization: require('./sequelizeSchemas/preRegisterPersonalization')(sequelize),
    User: require('./sequelizeSchemas/user')(sequelize),
    UserTokens: require('./sequelizeSchemas/userTokens')(sequelize)
};

// Import MongoDB models
const mongoModels = require('./mongoSchemas');

// Define associations for Sequelize models
Object.keys(sequelizeModels).forEach(modelName => {
    if (sequelizeModels[modelName].associate) {
        sequelizeModels[modelName].associate(sequelizeModels);
    }
});

// Database initialization function
const initializeDatabases = async () => {
    try {
        // Initialize Sequelize
        await sequelize.authenticate();
        logger.info('Sequelize database connection established successfully');

        // Initialize MongoDB
        await connectMongo();
        logger.info('MongoDB connection established successfully');

        // Sync Sequelize models in development
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: false });
            logger.info('Sequelize models synchronized');
        }

    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
};

// Export all models and connections
module.exports = {
    sequelize,
    initializeDatabases,
    ...sequelizeModels,
    ...mongoModels
}; 