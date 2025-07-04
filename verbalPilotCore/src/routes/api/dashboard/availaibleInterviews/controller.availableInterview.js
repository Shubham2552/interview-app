const { User, UserGroupMapping, InterviewObjectUserGroupMapping, InterviewObject, Category, InterviewObjectMeta } = require('../../../../../models');
const { responseMessages } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');

const handleAvailableInterview = async ({ userId }) => {

    try {
        logger.info('Starting handleAvailableInterview process', { userId });
        // Step 1: Get all group IDs for the user
        const userGroups = await UserGroupMapping.findAll({
            where: { userId, isActive: true, isDeleted: false },
            attributes: ['groupId']
        });
        const groupIds = userGroups.map(g => g.groupId);

        if (!groupIds.length) {
            logger.info('No groups found for user', { userId });
            return { Error: false, interviews: [] };
        }

        // Step 2: Get all interview IDs for these groups
        const interviewGroupMappings = await InterviewObjectUserGroupMapping.findAll({
            where: { UserGroupId: groupIds, isActive: true, isDeleted: false },
            attributes: ['InterviewObjectId']
        });
        const interviewObjectIds = interviewGroupMappings.map(m => m.InterviewObjectId);

        if (!interviewObjectIds.length) {
            logger.info('No interviews found for user groups', { userId, groupIds });
            return { Error: false, interviews: [] };
        }

        // Step 3: Get all interviews for these interviewObjectIds
        const interviews = await InterviewObject.findAll({
            where: { id: interviewObjectIds, isActive: true, isDeleted: false },
            include: [
            { model: Category, attributes: ['id', 'name'] },
            { model: InterviewObjectMeta, as: 'InterviewObjectMeta', attributes: ['id', 'name', 'displayName', 'description', 'QuestionPromptUserInputProperties', 'AnswerPromptUserInputProperties'] }
            ]
        });

        logger.info('Fetched available interviews', { userId, interviewCount: interviews.length });
        return { Error: false, interviews };
    } catch (error) {
        logError(error, __filename, { userId });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleAvailableInterview;