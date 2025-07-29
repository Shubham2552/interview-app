const {
    checkUserInterviewAccess,
    createUserInterviewWithMeta,
    userInterviewCappingCheck,
    getFullInterviewContext,
    insertUserInterviewQuestion
} = require('../../../../../models/queries/query.interview');
const { responseMessages, INTERVIEW_STATUSES } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const AIService = require('../../../../AISDK/classCluster/ClassKit/AIClasses/class.AIService');
const { logError } = require('../../../../utils/errorLogger');
const { getAllQuestionProps } = require('../../../../commonServices/assessment/buildAssessment');

const AIQuestionSetBuilder = async (userId, userInterviewId) => {

    const context = await getFullInterviewContext(userInterviewId, userId);
    if (!context) {
        logger.warn('No interview context found', { interviewId });
        return {
            Error: true,
            message: 'Interview context not found',
        };
    }

    const allProps = getAllQuestionProps(context.question_user_properties, context.meta_question_props, context.prompt_template_properties, []);
    const prompt = context.prompt_template_content || '';
    const InflatedPrompt = AIService.populatePromptTemplate(
        prompt,
        allProps
    );

    const Engine = await AIService.getEngine(context.ai_engine_type);
    let AIResponse = await Engine.generateContent({
        responseSchema: context.prompt_response_structure_content ? context.prompt_response_structure_content : {},
        prompt: InflatedPrompt,
    });
    let AIGeneratedQuestionSet = JSON.parse(AIResponse.text);
    const MergedQuestionSet = AIGeneratedQuestionSet.map(ele => {
        context.questionBody[0].properties = ele;
        return context.questionBody[0];
    })
    return MergedQuestionSet;
}

const handleStartInterview = async ({ interviewObjectId, UserId, questionProperties = {}, answerProperties = {} }) => {
    try {
        logger.info('Starting handleStartInterview process', { interviewObjectId, UserId });

        /* Check if user has not exhausted assessment limit */
        const { usedCount, userInterviewCapping, cycleId } = await userInterviewCappingCheck(UserId);


        if (
            usedCount && userInterviewCapping &&
            parseInt(usedCount, 10) >= parseInt(userInterviewCapping, 10)
        ) {
            return {
                Error: true,
                data: null,
                message: `You have reached your limit of ${userInterviewCapping} assessments.`,
            }
        }

        /* Check user has access to that interview object */
        const hasAccess = await checkUserInterviewAccess(UserId, interviewObjectId);

        if (!hasAccess) {
            logger.warn('User does not have access to interview object', { interviewObjectId, UserId });
            return {
                Error: true,
                data: null,
                message: responseMessages.ERROR_CONSTANTS.INTERVIEW_ACCESS_DENIED || 'Access denied to this interview'
            };
        }

        const result = await createUserInterviewWithMeta({
            interviewObjectId,
            userId: UserId,
            questionProperties,
            answerProperties,
            status: INTERVIEW_STATUSES.IN_PROGRESS || 'in_progress',
            cycleId: cycleId
        });

        /*         
            Generate all questions for assessment and store in user_interview_question.
        */

        if (hasAccess.isSynced) {
            const QuestionSet = await AIQuestionSetBuilder(UserId, result?.userInterview?.id);
            const insertQuestionQueryOutput = await insertUserInterviewQuestion(result?.userInterview?.id, QuestionSet);
        }

        const { 
            userInterview, 
            userInterviewMeta 
        } = result;

        logger.info('Interview started successfully', {
            userInterviewId: userInterview.id,
            userInterviewMetaId: userInterviewMeta.id
        });

        return {
            Error: false,
            data: {
                userInterview,
                userInterviewMeta
            },
            message: responseMessages.SUCCESS_CONSTANTS.INTERVIEW_STARTED_SUCCESSFULLY
        };

    } catch (error) {
        logger.error('Failed to start interview', {
            interviewObjectId,
            UserId,
            error: error.message
        });

        logError(error, __filename, { interviewObjectId, UserId });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleStartInterview;