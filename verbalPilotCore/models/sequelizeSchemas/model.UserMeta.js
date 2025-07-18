const { DataTypes } = require('sequelize');
const { sequelize } = require('..');

module.exports = (sequelize) => {
    return sequelize.define('UserMeta', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        UserSubscriptionType: {
            type: DataTypes.ENUM('FREE', 'PRO', 'ENTERPRISE'),
            allowNull: false,
            defaultValue: 'FREE'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'UserMeta',
        timestamps: true
    });
}