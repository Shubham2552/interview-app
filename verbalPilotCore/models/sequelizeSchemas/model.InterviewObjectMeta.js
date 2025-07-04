const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('InterviewObjectMeta', {
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
        PreDefinedQuestionPromptValues: {
            //it is a JSON object that contains the pre-defined question prompt values
            type: DataTypes.JSONB,
            allowNull: true,
        },
        PreDefinedAnswerPromptValues: {
            //it is a JSON object that contains the pre-defined answer prompt values
            type: DataTypes.JSONB,
            allowNull: true,
        },
        //json for properties keys and their values array in form of json 
        QuestionPromptUserInputProperties: {
            type: DataTypes.JSONB,
            allowNull: true,
        },
        AnswerPromptUserInputProperties: {
            type: DataTypes.JSONB,
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