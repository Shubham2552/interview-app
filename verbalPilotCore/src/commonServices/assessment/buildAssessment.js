const AIService = require('../../AISDK/classCluster/ClassKit/AIClasses/class.AIService');
const logger = require('../../utils/logger');

module.exports.getAllQuestionProps = (userQuestionProperties = {}, preDefinedQuestionProperties = {}, questionPropsArray = [], history = []) => {
    const allProps = { ...userQuestionProperties, ...preDefinedQuestionProperties, history };

    const missingKeys = questionPropsArray.filter(
        key => !(key in allProps)
    );
    if (missingKeys.length > 0) {
        logger.warn('Missing keys in QuestionPropsObject:', { missingKeys });
        throw new Error(`Missing required question properties: ${missingKeys.join(', ')}`);
    }
    return allProps;

}

module.exports.buildPromptFromContext = ({prompt, userDefinedProperties, preDefinedProperties, propertiesArray}) => {
    const allProps = this.getAllQuestionProps(userDefinedProperties, preDefinedProperties, propertiesArray, []);
    return AIService.populatePromptTemplate(
        prompt,
        allProps
    );
}

