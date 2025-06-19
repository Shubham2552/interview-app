const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserToken = sequelize.define('UserToken', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        jwtExpiry: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'JWT expiry timestamp'
        },
        deviceInfo: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'Optional: device or browser info'
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isIP: true
            },
            comment: 'Optional: IP address'
        },
        tokenType: {
            type: DataTypes.ENUM('access', 'refresh', 'reset_password'),
            allowNull: false,
            defaultValue: 'access'
        },
        isRevoked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'user_tokens',
        timestamps: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['token'],
                unique: true
            },
            {
                fields: ['userId', 'tokenType', 'isRevoked']
            }
        ]
    });

    return UserToken;
};
