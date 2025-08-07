const {
    insertUserInterviewResponseFeedback,
    insertUserInterviewAnswer,
    getLatestUserInterviewQuestion,
    getFullResponseInterviewContext,
    skipUserInterviewQuestion,
    getIsSyncedFromUserInterview,
    getQuestionStatus
} = require('../../../../../models/queries/query.interview');
const { responseMessages, QUESTION_STATUS, INTERVIEW_STATUSES } = require('../../../../constant/genericConstants/commonConstant');
const logger = require('../../../../utils/logger');
const { logError } = require('../../../../utils/errorLogger');
const AIService = require('../../../../AISDK/classCluster/ClassKit/AIClasses/class.AIService');

const handleSubmitResponse = async ({ userInterviewId, answer, status, interviewQuestionId, userId }) => {
    try {
        logger.info('Starting handleSubmitResponse process', { userInterviewId, status });

        //Get User context
        const context = await getFullResponseInterviewContext(userInterviewId, userId, INTERVIEW_STATUSES.COMPLETED);
        const questionStatus = await getQuestionStatus(interviewQuestionId);
        if (!questionStatus) return {
            Error: true,
            message: 'Already answered or Invalid Question!',
        };

        //Check valid context
        if (!context) {
            logger.warn('No interview context found for feedback generation', { userInterviewId });
            return {
                Error: true,
                message: 'Interview context not found for feedback generation',
                data: null
            };
        }

        if (status === QUESTION_STATUS.SKIPPED) {
            const skipQuestion = await skipUserInterviewQuestion(interviewQuestionId);
            if (skipQuestion) {
                return {
                    Error: false,
                    message: 'Question skipped!',
                    data: null,
                }
            }
            return {
                Error: true,
                message: 'Error skipping question!!',
            }
        }

        let responseData = null;
        //Transform string answer to object
        if (typeof answer === 'string') {
            const answerObject = { answer };
            responseData = await insertUserInterviewAnswer({ interviewQuestionId, answerObject });

        }

        const assessmentSyncStatus = await getIsSyncedFromUserInterview(userId, userInterviewId);

        if (assessmentSyncStatus.isSynced) {
            return {
                Error: false,
                message: 'Response submitted successfully',
                data: null
            }
        }

        let question = await getLatestUserInterviewQuestion(userInterviewId);
        question = question?.question_object[0]?.properties?.content;

        //Funtion to create merge all props and pass to prompt inflater
        const populateMeta = ({ context, question, answer }) => {
            let userProps, metaProps;
            userProps = context.feedbackUserProperties ? context.feedbackUserProperties : {};
            metaProps = context.feedbackPreDefinedObject ? context.feedbackPreDefinedObject : {};

            return {
                ...metaProps,
                ...userProps,
                question: question || '',
                answer: answer || '',
            };
        }

        const feedbackPropsObject = populateMeta({
            context, question, answer
        });

        // Build feedback prompt using the real template
        const feedbackPrompt = context.feedbackTemplate || 'Provide feedback for the following answer: {{answer}}';
        const InflatedPrompt = AIService.populatePromptTemplate(
            feedbackPrompt,
            feedbackPropsObject
        );
        logger.info('Inflated Feedback Prompt:', { InflatedPrompt });

        // Get AI engine and response schema for feedback
        const aiEngineType = context.feedbackAIEngineType || 'default';
        let responseSchema = {};
        try {
            responseSchema = context.feedbackResponseStructureContent ? context.feedbackResponseStructureContent : {};
        } catch (e) { responseSchema = {}; }

        const Engine = await AIService.getEngine(aiEngineType);
        let result = await Engine.generateContent({
            responseSchema,
            prompt: InflatedPrompt,
        });
        logger.info('Generated feedback', { result: result.text });
        result = JSON.parse(result.text);



        if (typeof result === 'string') {
            try {
                result = JSON.parse(result);
            } catch (e) {
                console.error('Result is not valid JSON:', result);
                result = {};
            }
        }

        //Inserting the feedback response
        const feedbackResponseData = await insertUserInterviewResponseFeedback({
            interviewResponseId: responseData.id,
            feedbackObject: result,
        })

        console.log('Template before:', context.feedbackResponseStructureObject);
        console.log('Result:', result);
        console.log('typeof context.feedbackResponseStructureObject:', typeof context.feedbackResponseStructureObject);
        console.log('Array.isArray(context.feedbackResponseStructureObject):', Array.isArray(context.feedbackResponseStructureObject));
        console.log('context.feedbackResponseStructureObject === null:', context.feedbackResponseStructureObject === null);
        console.log('context.feedbackResponseStructureObject:', context.feedbackResponseStructureObject);

        if (!context.feedbackResponseStructureObject) {
            // Default to object or array as needed
            context.feedbackResponseStructureObject = {};
        }

        if (
            Array.isArray(context.feedbackResponseStructureObject) &&
            context.feedbackResponseStructureObject.length === 1 &&
            typeof context.feedbackResponseStructureObject[0] === 'object' &&
            !Array.isArray(context.feedbackResponseStructureObject[0]) &&
            result && typeof result === 'object' && !Array.isArray(result)
        ) {
            // Populate the first object in the array
            for (const key in context.feedbackResponseStructureObject[0]) {
                if (Object.prototype.hasOwnProperty.call(result, key)) {
                    if (
                        Array.isArray(context.feedbackResponseStructureObject[0][key]) &&
                        Array.isArray(result[key])
                    ) {
                        context.feedbackResponseStructureObject[0][key] = [...result[key]];
                    } else {
                        context.feedbackResponseStructureObject[0][key] = result[key];
                    }
                }
            }
            console.log('Populated feedbackResponseStructureObject (array[0]):', context.feedbackResponseStructureObject);
        } else if (Array.isArray(context.feedbackResponseStructureObject) && Array.isArray(result)) {
            context.feedbackResponseStructureObject = [...result];
            console.log('Populated feedbackResponseStructureObject (array):', context.feedbackResponseStructureObject);
        } else if (
            context.feedbackResponseStructureObject &&
            typeof context.feedbackResponseStructureObject === 'object' &&
            !Array.isArray(context.feedbackResponseStructureObject)
        ) {
            for (const key in context.feedbackResponseStructureObject) {
                if (Object.prototype.hasOwnProperty.call(result, key)) {
                    if (
                        Array.isArray(context.feedbackResponseStructureObject[key]) &&
                        Array.isArray(result[key])
                    ) {
                        context.feedbackResponseStructureObject[key] = [...result[key]];
                    } else {
                        context.feedbackResponseStructureObject[key] = result[key];
                    }
                }
            }
            console.log('Populated feedbackResponseStructureObject (object):', context.feedbackResponseStructureObject);
        } else {
            console.log('feedbackResponseStructureObject is neither array nor object:', context.feedbackResponseStructureObject);
        }

        return {
            Error: false,
            data: context.feedbackResponseStructureObject,
            message: 'Feedback generated successfully.'
        };
    } catch (error) {
        logError(error, __filename, { userInterviewId });
        throw error; // Let the global error handler handle it
    }
};

module.exports = handleSubmitResponse; 