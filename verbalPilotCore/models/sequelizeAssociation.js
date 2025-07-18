module.exports = (models) => {
    const {
        InterviewObject,
        InterviewObjectMeta,
        InterviewClass,
        Category,
        User,
        UserTokens,
        UserGroup,
        UserGroupMapping,
        InterviewObjectUserGroupMapping,
        AIEngine,
        PromptResponseStructures,
        Prompts,
        UserMeta,
        UserInterview,
        UserInterviewMeta,
        UserInterviewQuestions,
        UserInterviewAnswers
    } = models;



    if (InterviewClass && InterviewObject) {
        InterviewClass.hasMany(InterviewObject, { foreignKey: 'InterviewClassId' });
        InterviewObject.belongsTo(InterviewClass, { foreignKey: 'InterviewClassId' });
    }

    if (InterviewObjectMeta && InterviewObject) {
        InterviewObjectMeta.hasOne(InterviewObject, { foreignKey: 'InterviewObjectMetaId', as: 'InterviewObject' });
        InterviewObject.belongsTo(InterviewObjectMeta, { foreignKey: 'InterviewObjectMetaId', as: 'InterviewObjectMeta' });
    }

    if (Category && InterviewObject) {
        Category.hasMany(InterviewObject, { foreignKey: 'CategoryId' });
        InterviewObject.belongsTo(Category, { foreignKey: 'CategoryId' });
    }

    User.belongsToMany(UserGroup, { through: UserGroupMapping, foreignKey: 'userId', otherKey: 'groupId' });
    UserGroup.belongsToMany(User, { through: UserGroupMapping, foreignKey: 'groupId', otherKey: 'userId' });

    UserGroupMapping.belongsTo(User, { foreignKey: 'userId' });
    UserGroupMapping.belongsTo(UserGroup, { foreignKey: 'groupId' });
    User.hasMany(UserGroupMapping, { foreignKey: 'userId' });
    UserGroup.hasMany(UserGroupMapping, { foreignKey: 'groupId' });

    //Make UserTokens reference User
    if (UserTokens && User) {
        UserTokens.belongsTo(User, { foreignKey: 'userId' });
        User.hasMany(UserTokens, { foreignKey: 'userId' });
    }

    //associate InterviewObjectUserGroupMapping with InterviewObject and UserGroup
    if (InterviewObjectUserGroupMapping && InterviewObject && UserGroup) {
        InterviewObjectUserGroupMapping.belongsTo(InterviewObject, { foreignKey: 'InterviewObjectId' });
        InterviewObject.hasMany(InterviewObjectUserGroupMapping, { foreignKey: 'InterviewObjectId' });
        InterviewObjectUserGroupMapping.belongsTo(UserGroup, { foreignKey: 'UserGroupId' });
        UserGroup.hasMany(InterviewObjectUserGroupMapping, { foreignKey: 'UserGroupId' });
    }

    //Associate with InterviewClass the AIEngine and PromptResponseStructures
    if (AIEngine && InterviewClass) {
        InterviewClass.belongsTo(AIEngine, { as: 'QuestionAIEngine', foreignKey: 'QuestionAIEngineId' });
        AIEngine.hasMany(InterviewClass, { as: 'QuestionAIEngineClasses', foreignKey: 'QuestionAIEngineId' });

        InterviewClass.belongsTo(AIEngine, { as: 'AnswerAIEngine', foreignKey: 'AnswerAIEngineId' });
        AIEngine.hasMany(InterviewClass, { as: 'AnswerAIEngineClasses', foreignKey: 'AnswerAIEngineId' });
    }

    // Associate InterviewClass with PromptResponseStructures for question and answer
    if (PromptResponseStructures && InterviewClass) {
        InterviewClass.belongsTo(PromptResponseStructures, { as: 'QuestionPromptResponse', foreignKey: 'QuestionPromptResponseStructureId' });
        InterviewClass.belongsTo(PromptResponseStructures, { as: 'AnswerPromptResponseStructures', foreignKey: 'AnswerPromptResponseStructureId' });

        PromptResponseStructures.hasMany(InterviewClass, { as: 'QuestionPromptResponseClasses', foreignKey: 'QuestionPromptResponseStructureId' });
        PromptResponseStructures.hasMany(InterviewClass, { as: 'AnswerPromptResponseClasses', foreignKey: 'AnswerPromptResponseStructureId' });
    }

    InterviewClass.belongsTo(Prompts, { as: 'QuestionPrompt', foreignKey: 'QuestionPromptId' });
    Prompts.hasMany(InterviewClass, { as: 'QuestionPromptClasses', foreignKey: 'QuestionPromptId' });

    InterviewClass.belongsTo(Prompts, { as: 'AnswerPrompt', foreignKey: 'AnswerPromptId' });
    Prompts.hasMany(InterviewClass, { as: 'AnswerPromptClasses', foreignKey: 'AnswerPromptId' });

    UserMeta.belongsTo(User, { foreignKey: 'userId' });
    User.hasOne(UserMeta, { foreignKey: 'userId' });

    //UserInterview has one UserInterviewMeta
    if (UserInterview && UserInterviewMeta) {
        UserInterview.hasOne(UserInterviewMeta, { foreignKey: 'UserInterviewId', as: 'UserInterviewMeta' });
        UserInterviewMeta.belongsTo(UserInterview, { foreignKey: 'UserInterviewId', as: 'UserInterview' });
    }
    // UserInterview belongs to User
    if (UserInterview && User) {
        UserInterview.belongsTo(User, { foreignKey: 'UserId' });
        User.hasMany(UserInterview, { foreignKey: 'UserId' });
    }

    //UserInterview belongs to InterviewObject
    if (UserInterview && InterviewObject) {
        UserInterview.belongsTo(InterviewObject, { foreignKey: 'InterviewObjectId' });
        InterviewObject.hasMany(UserInterview, { foreignKey: 'InterviewObjectId' });
    }

    if (UserInterview && UserInterviewQuestions) {
        UserInterviewQuestions.belongsTo(UserInterview, { foreignKey: 'UserInterviewId' });
        UserInterview.hasMany(UserInterviewQuestions, { foreignKey: 'UserInterviewId' });
    }

    if (UserInterviewQuestions && UserInterviewAnswers) {
        UserInterviewAnswers.belongsTo(UserInterviewQuestions, { foreignKey: 'InterviewQuestionId' });
        UserInterviewQuestions.hasOne(UserInterviewAnswers, { foreignKey: 'InterviewQuestionId' })
    }
};