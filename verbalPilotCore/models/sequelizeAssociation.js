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
        Prompts
    } = models;



    if (InterviewClass && InterviewObject) {
        InterviewClass.hasMany(InterviewObject, { foreignKey: 'InterviewClassId' });
        InterviewObject.belongsTo(InterviewClass, { foreignKey: 'InterviewClassId' });
    }

    if (InterviewObjectMeta && InterviewObject) {
        InterviewObjectMeta.hasOne(InterviewObject, { foreignKey: 'InterviewObjectMetaId', as: 'InterviewObject' });
        InterviewObject.belongsTo(InterviewObjectMeta, { foreignKey: 'InterviewObjectMetaId', as: 'InterviewObjectMeta' });
    }

    if(Category && InterviewObject) {
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
        InterviewClass.belongsTo(PromptResponseStructures, { as: 'QuestionPromptResponseStructure', foreignKey: 'QuestionPromptResponseStructureId' });
        InterviewClass.belongsTo(PromptResponseStructures, { as: 'AnswerPromptResponseStructure', foreignKey: 'AnswerPromptResponseStructureId' });

        PromptResponseStructures.hasMany(InterviewClass, { as: 'QuestionPromptResponseClasses', foreignKey: 'QuestionPromptResponseStructureId' });
        PromptResponseStructures.hasMany(InterviewClass, { as: 'AnswerPromptResponseClasses', foreignKey: 'AnswerPromptResponseStructureId' });
    }

    InterviewClass.belongsTo(Prompts, { as: 'QuestionPrompt', foreignKey: 'QuestionPromptId' });
    Prompts.hasMany(InterviewClass, { as: 'QuestionPromptClasses', foreignKey: 'QuestionPromptId' });

    InterviewClass.belongsTo(Prompts, { as: 'AnswerPrompt', foreignKey: 'AnswerPromptId' });
    Prompts.hasMany(InterviewClass, { as: 'AnswerPromptClasses', foreignKey: 'AnswerPromptId' });
    // Example: more associations
    // if (InterviewClass && InterviewObject) {
    //     InterviewClass.hasMany(InterviewObject, { foreignKey: 'InterviewClassId' });
    //     InterviewObject.belongsTo(InterviewClass, { foreignKey: 'InterviewClassId' });
    // }
};