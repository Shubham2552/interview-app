const { DataTypes } = require('sequelize');
const sequelize = require('../dbConnections/sqlConnection'); // Adjust the path as per your project structure
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    firstname:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
    },
    dateofbirth: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    isverified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isdeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verificationcode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'users',
    timestamps: true,
});

module.exports = User;