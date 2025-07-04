const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('InterviewClass', {
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
        QuestionPromptId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        AnswerPromptId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        QuestionAIEngineId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        AnswerAIEngineId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        QuestionPromptResponseStructureId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        AnswerPromptResponseStructureId: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
}