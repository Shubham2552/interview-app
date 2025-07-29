const {
    getLatestUserInterviewQuestion,
    insertUserInterviewQuestion,
    getFullInterviewContext,
    getAllInterviewQuestions,
    userInterviewQuestionCappingCheck,
    getIsSyncedFromUserInterview
} = require('../../../../../models/queries/query.interview');
const { responseMessages } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');
const AIService = require('../../../../AISDK/classCluster/ClassKit/AIClasses/class.AIService');
const { getAllQuestionProps } = require('../../../../commonServices/assessment/buildAssessment');

const ResponseMessages = {
    'QUESTION_FETCHED': 'Question fetched successfully!',
    'QUESTION_COMPLETED':'Questions are completed and you can end the assessment!',
    'ERROR': 'Some error occured!!'
}

const handleInterviewQuestion = async ({ interviewId, userId }) => {
    try {
        logger.info('Starting handleInterviewQuestion process', { interviewId });

        // 1. Check for latest question
        const unAnsweredQuestion = await getLatestUserInterviewQuestion(interviewId);
        if (unAnsweredQuestion) {
            return {
                Error: false,
                data: [{ ...unAnsweredQuestion.question_object, id: unAnsweredQuestion.id }],
                message: ResponseMessages.QUESTION_FETCHED,
            }
        }

        const assessmentSyncStatus = await getIsSyncedFromUserInterview(userId, interviewId);

        /* If the interview is synced and not question is availaible to answer,
         then send status interview questions are over, and user should end the interview here. */
        if (assessmentSyncStatus.isSynced && !unAnsweredQuestion) {
            return {
                Error: false,
                data: null,
                status: 204,
                message: ResponseMessages.QUESTION_COMPLETED
            }
        }

        const context = await getFullInterviewContext(interviewId, userId);
        if (!context) {
            logger.warn('No interview context found', { interviewId });
            return {
                Error: true,
                message: 'Interview context not found',
            };
        }

        const userQuestionCapping = await userInterviewQuestionCappingCheck(userId, interviewId);


        //Question capping check
        if (userQuestionCapping && userQuestionCapping.total_interview_questions >= userQuestionCapping.interview_question_capping) {
            return {
                Error: true,
                message: `You have reach maximum limit of ${userQuestionCapping.interview_question_capping} questions!`,
            }
        }

        //build history of previous question_object props
        const allPreviousQuestions = await getAllInterviewQuestions(interviewId);
        const history = allPreviousQuestions.reduce((acc, curr) => {
            acc.push(curr.question_object);
            return acc;
        }, []);

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
            prompt: InflatedPrompt,
        });

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

        const questionData = await insertUserInterviewQuestion(interviewId, context.response_structure);
        return {
            Error: false,
            data: [{ ...context.response_structure[0], id: questionData.id }],
            message: responseMessages.SUCCESS_CONSTANTS.INTERVIEW_OBJECT_META_FETCHED
        };
    } catch (error) {
        logError(error, __filename, { interviewId });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleInterviewQuestion;

