const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('UserInterviewQuestions', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        UserInterviewId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        QuestionText: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
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
        tableName: 'UserInterviewQuestions',
        timestamps: true
    })
}


/*
Step 1: Question generate, and store in UserInterviewQuestion
Step 2: 
a) User respond to question:
 submit the api goes to backend and store the answer
 ai is called and feedback is generated and response of feedback is stored

b) User skip the question 
 question is marked as skipped
c) User end the interview 
end api is called
d) Click for next question
    after submit it will call the next question
*/