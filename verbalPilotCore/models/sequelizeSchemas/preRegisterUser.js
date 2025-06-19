const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const PreRegisterUser = sequelize.define('PreRegisterUser', {
        id: {            
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            // unique: true, // Removed unique constraint
            validate: {
                isEmail: true
            }
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
        tableName: 'pre_register_users',
    });

    return PreRegisterUser;
};
