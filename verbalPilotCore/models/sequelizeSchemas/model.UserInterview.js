const { DataTypes } = require('sequelize');
const { sequelize } = require('..');

module.exports = (sequelize) => {
    return sequelize.define('UserInterviews', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        UserId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        InterviewObjectId: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        tableName: 'UserInterviews',
        timestamps: true
    })
}