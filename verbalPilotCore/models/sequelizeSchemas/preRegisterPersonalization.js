const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PreRegisterPersonalization = sequelize.define('PreRegisterPersonalization', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        roles: {
            type: DataTypes.STRING,
            allowNull: true
        },
        jobHunting: {
            type: DataTypes.STRING,
            allowNull: true
        },
        challenges: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        willPay: {
            type: DataTypes.STRING,
            allowNull: true
        },
        featureSuggestion: {
            type: DataTypes.TEXT,
            allowNull: true
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
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'pre_register_personalizations',
        indexes: [
            {
                fields: ['userId']
            }
        ]
    });

    return PreRegisterPersonalization;
}; 