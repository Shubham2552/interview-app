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
            unique: true,
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