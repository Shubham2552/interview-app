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
