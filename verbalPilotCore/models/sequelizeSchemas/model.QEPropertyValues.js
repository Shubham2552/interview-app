const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('QEPropertyValues', {
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
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        templateId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'PromptTemplates', // Assuming the Templates model is defined elsewhere
                key: 'id'
            },
            onDelete: 'CASCADE' // Optional: define behavior on delete
        },
        templateDataValues: {
            type: DataTypes.JSONB,
            allowNull: false
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
    });
}