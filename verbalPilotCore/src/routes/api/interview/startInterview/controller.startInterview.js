const { checkUserInterviewAccess, createUserInterviewWithMeta, userInterviewCappingCheck } = require('../../../../../models/queries/query.interview');
const { responseMessages, INTERVIEW_STATUSES } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleStartInterview = async ({ interviewObjectId, UserId, questionProperties = {}, answerProperties = {} }) => {
    try {
        logger.info('Starting handleStartInterview process', { interviewObjectId, UserId });

        // Step 1: Check if user has access to this interview object
        const hasAccess = await checkUserInterviewAccess(UserId, interviewObjectId);
        const userInterviewCapping = await userInterviewCappingCheck(UserId);

        if(userInterviewCapping && parseInt(userInterviewCapping.total_interviews) >= userInterviewCapping.user_interview_capping) {
            return {
                Error: true,
                data: null,
                message: `You have reached your limit of ${userInterviewCapping.user_interview_capping} interviews.`,
            }
        }
        
        if (!hasAccess) {
            logger.warn('User does not have access to interview object', { interviewObjectId, UserId });
            return { 
                Error: true, 
                data: null, 
                message: responseMessages.ERROR_CONSTANTS.INTERVIEW_ACCESS_DENIED || 'Access denied to this interview' 
            };
        }

        // Step 2: Create UserInterview and UserInterviewMeta in transaction
        const result = await createUserInterviewWithMeta({
            interviewObjectId,
            userId: UserId,
            questionProperties,
            answerProperties,
            status: INTERVIEW_STATUSES.IN_PROGRESS || 'in_progress'
        });

        const { userInterview, userInterviewMeta } = result;
        
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