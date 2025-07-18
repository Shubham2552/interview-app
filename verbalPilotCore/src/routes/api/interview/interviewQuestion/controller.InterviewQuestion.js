const {
    getLatestUserInterviewQuestion,
    insertUserInterviewQuestion,
    getFullInterviewContext,
    getAllInterviewQuestions,
    userInterviewQuestionCappingCheck
} = require('../../../../../models/queries/query.interview');
const { responseMessages, QUESTION_STATUS,   } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');
const AIService = require('../../../../AISDK/classCluster/ClassKit/AIClasses/class.AIService');

const ResponseMessages = {
    'QUESTION_FETCHED': 'Question fetched successfully',
    'ERROR': 'Some error occured'
}

const handleInterviewQuestion = async ({ interviewId, userId }) => {
    try {
        logger.info('Starting handleInterviewQuestion process', { interviewId });

        // 1. Check for latest question
        const latestQuestion = await getLatestUserInterviewQuestion(interviewId);
        if (latestQuestion && latestQuestion.status === QUESTION_STATUS.UNANSWERED) {
            return {
                Error: false,
                data: [{...latestQuestion.question_object[0], id: latestQuestion.id}],
                message: ResponseMessages.QUESTION_FETCHED,
            }
        }

        // 2. No unanswered question, generate a new one using AIService
        const context = await getFullInterviewContext(interviewId, userId);
        if (!context) {
            logger.warn('No interview context found', { interviewId });
            return {
                Error: true,
                message: 'Interview context not found',
            };
        }

        const userQuestionCapping = await userInterviewQuestionCappingCheck(userId, interviewId);

        if(userQuestionCapping && userQuestionCapping.total_interview_questions >= userQuestionCapping.interview_question_capping ){
            return {
                Error: true,
                message: `You have reach maximum limit of ${userQuestionCapping.interview_question_capping} questions!`,
            }
        }

        const allPreviousQuestions = await getAllInterviewQuestions(interviewId);
        const history = allPreviousQuestions.reduce((acc, curr)=> {
            acc.push(curr.question_object);
            return acc;
        },[]);

        const getAllQuestionProps = (userQuestionProperties = {}, preDefinedQuestionProperties = {}, questionPropsArray =[], history = []) => {
            const allProps = {...userQuestionProperties, ...preDefinedQuestionProperties, history};

            const missingKeys = questionPropsArray.filter(
                key => !(key in allProps)
            );
            if (missingKeys.length > 0) {
                logger.warn('Missing keys in QuestionPropsObject:', { missingKeys });
                throw new Error(`Missing required question properties: ${missingKeys.join(', ')}`);
            }
            return allProps;
            
        }
        const allProps = getAllQuestionProps(context.question_user_properties, context.meta_question_props, context.prompt_template_properties, history);

        const prompt = context.prompt_template_content || '';
        const InflatedPrompt = AIService.populatePromptTemplate(
            prompt,
            allProps
        );

        logger.info('Inflated Prompt:', { InflatedPrompt });
       
        const Engine = await AIService.getEngine(context.ai_engine_type);
        let result = await Engine.generateContent({   
            responseSchema: context.prompt_response_structure_content ? context.prompt_response_structure_content : {},
            prompt: InflatedPrompt,});

        logger.info('Generated new question', { result: result.text });
        result = JSON.parse(result.text);

        if (Array.isArray(context.response_structure)) {
            context.response_structure.forEach(propertyObj => {
                if (
                    propertyObj &&
                    propertyObj.properties &&
                    typeof propertyObj.properties === 'object'
                ) {
                    // For each key in the properties object, if result has that key, set it
                    Object.keys(propertyObj.properties).forEach(propKey => {
                        if (Object.prototype.hasOwnProperty.call(result, propKey)) {
                            propertyObj.properties[propKey] = result[propKey];
                        }
                    });
                }
            });
        }
  
       const questionData =  await insertUserInterviewQuestion(interviewId, context.response_structure);
        return {
            Error: false,
            data: [{...context.response_structure[0], id: questionData.id}],
            message: responseMessages.SUCCESS_CONSTANTS.INTERVIEW_OBJECT_META_FETCHED
        };
    } catch (error) {
        logError(error, __filename, { interviewId });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleInterviewQuestion;

