const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('UserInterviewMeta', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        UserInterviewId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        QuestionUserProperties: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        AnswerUserProperties: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        status: {
            type: DataTypes.ENUM('IN_PROGRESS', 'COMPLETED'),
            allowNull: false,
            defaultValue: 'IN_PROGRESS'
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
        tableName: 'UserInterviewMeta',
        timestamps: true
    });
}