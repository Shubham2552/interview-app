const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Database configuration
const config = {
    database: process.env.POSTGRES_DB || 'verbalpilot',
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    dialect: process.env.POSTGRES_DIALECT || 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
};

// Create Sequelize instance
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host: config.host,
        dialect: config.dialect,
        logging: config.logging,
        pool: config.pool,
        define: {
            timestamps: true
        }
    }
);

// Import models
const User = require('./sequelizeSchemas/user');
const UserToken = require('./sequelizeSchemas/userTokens');

// Initialize models
const models = {
    User: User(sequelize),
    UserToken: UserToken(sequelize)
};

// Set up associations
models.User.hasMany(models.UserToken, {
    foreignKey: 'userId',
    as: 'tokens'
});

models.UserToken.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
});

// Database initialization function
const initializeDatabase = async () => {
    try {
        // Test the connection
        await sequelize.authenticate();
        logger.info('Database connection established successfully');

        // Sync models with database
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: false }); // Changed from alter: true to false for safety
            logger.info('Database models synchronized');
        }

        return true;
    } catch (error) {
        logger.error('Database initialization failed', {
            error: error.message,
            stack: error.stack,
            code: error.original?.code,
            detail: error.original?.detail
        });

        if (error.original?.code === 'XX000') {
            logger.error('PostgreSQL system catalog error. Please ensure:', {
                checks: [
                    'Database exists and is accessible',
                    'User has sufficient permissions',
                    'PostgreSQL service is running',
                    'No database corruption'
                ]
            });
        }

        throw error;
    }
};

module.exports = {
    sequelize,
    initializeDatabase,
    ...models
}; 