const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('UserPermissionsMapping', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userGroupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'UserGroup', // Assuming you have a UserGroup model
                key: 'id'
            }
        },
        permissionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'UserPermissions', // Assuming you have a UserPermissions model
                key: 'id'
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            default: false,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            default: false,
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
    })
}