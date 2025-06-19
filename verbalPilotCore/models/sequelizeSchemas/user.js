const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
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
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isNumeric: true,
            },
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false,
        },
        dateOfBirth: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verificationCode: {
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
        indexes: [
            {
                unique: true,
                fields: ['email']
            }
        ]
    });

    return User;
};