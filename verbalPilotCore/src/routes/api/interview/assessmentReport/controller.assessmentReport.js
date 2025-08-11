const {
    getFullResponseInterviewContext,
    getFullInterviewContext,
    AssessmentDataFromUserInterview,
    storeUserAssessment,
    getUserAssessmentReport
} = require('../../../../../models/queries/query.interview');
const { responseMessages, QUESTION_STATUS, INTERVIEW_STATUSES } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');
const AIService = require('../../../../AISDK/classCluster/ClassKit/AIClasses/class.AIService');
const { buildPromptFromContext } = require('../../../../commonServices/assessment/buildAssessment');

const mapAssessmentReport = (assessmentReportObject, reportResponseObject) => {
    return reportResponseObject.map((ele) => {
        ele.properties.value = assessmentReportObject[ele.key];
        return ele;
    });
}

const handleAssessmentReport = async ({ userInterviewId, userId }) => {
    try {

        /*
        First build the question builder prompt,
        Get all question, answers, skipped, unanswered questions
        Pass:-  question prompt, question with their answers, and feedback prompt setting
        Get the generated report.
         */
        logger.info('Starting handleAssessmentReport process', { userInterviewId, userId });

        const context = await getFullInterviewContext(userInterviewId, userId, INTERVIEW_STATUSES.IN_PROGRESS);
        const assessmentAnswerContext = await getFullResponseInterviewContext(userInterviewId, userId, INTERVIEW_STATUSES.IN_PROGRESS);
        if (!context) return {
            Error: true,
            message: 'Invalid Assessment!',
        }

        const userAssessmentReport = await getUserAssessmentReport(userId, userInterviewId);

        if (userAssessmentReport) return {
            Error: false,
            message: 'API Success! User Assessment Report Retrieved!',
            data: mapAssessmentReport(userAssessmentReport.userAssessmentReport, assessmentAnswerContext.feedbackResponseStructureObject),
        }

        const questionPrompt = buildPromptFromContext({
            prompt: context.prompt_template_content,
            preDefinedProperties: context.meta_question_props,
            userDefinedProperties: context.question_user_properties,
            propertiesArray: context.prompt_template_properties
        })

        const userAssessmentData = await AssessmentDataFromUserInterview(userId, userInterviewId)



        const assessmentReportPrompt = buildPromptFromContext({
            prompt: assessmentAnswerContext.feedbackTemplate,
            preDefinedProperties: assessmentAnswerContext.feedbackPreDefinedObject,
            userDefinedProperties: {
                questionPrompt,
                userAssessmentData,
                ...assessmentAnswerContext.feedbackUserProperties
            },
            propertiesArray: assessmentAnswerContext.feedbackTemplateProperties
        })

        const aiEngineType = assessmentAnswerContext.feedbackAIEngineType || 'default';
        let responseSchema = assessmentAnswerContext.feedbackResponseStructureContent ? assessmentAnswerContext.feedbackResponseStructureContent : {};


        const Engine = await AIService.getEngine(aiEngineType);
        let result = await Engine.generateContent({
            responseSchema,
            prompt: assessmentReportPrompt,
        });
        logger.info('Generated feedback', { result: result.text });
        result = JSON.parse(result.text);

        const storeAssessmentResult = await storeUserAssessment(userInterviewId, result);

        return {
            Error: false,
            data: mapAssessmentReport(result, assessmentAnswerContext.feedbackResponseStructureObject),
            message: 'API Sucess!'
        }

    } catch (error) {
        logError(error, __filename, { userInterviewId });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleAssessmentReport;

/* [{

},{

},{
    
}] */