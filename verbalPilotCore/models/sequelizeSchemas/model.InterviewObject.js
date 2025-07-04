const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('InterviewObject', {
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
        InterviewClassId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // references: {
            //     model: 'InterviewClass',
            //     key: 'id'
            // }
        },
        InterviewObjectMetaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // references: {
            //     model: 'InterviewObjectMeta',
            //     key: 'id'
            // },
        },
        CategoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // references: {
            //     model: 'Category',
            //     key: 'id'
            // }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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
};