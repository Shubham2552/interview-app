const {
  getFullResponseInterviewContext,
  getFullInterviewContext,
  getUserAssessmentQuestionAnswer,
  insertUserAssessmentAnswerEvaluation,
  userInterviewCappingCheck,
} = require("../../../../../models/queries/query.interview");
const {
  responseMessages,
  QUESTION_STATUS,
  INTERVIEW_STATUSES,
} = require("../../../../constant/genericConstants/commonConstant");
const logger = require("../../../../utils/logger");
const { logError } = require("../../../../utils/errorLogger");
const AIService = require("../../../../AISDK/classCluster/ClassKit/AIClasses/class.AIService");
const {
  buildPromptFromContext,
  getAllQuestionProps,
} = require("../../../../commonServices/assessment/buildAssessment");

const AIResponseMapper = (AIGeneratedResponse, storedResponseStructure) => {
  return storedResponseStructure.map((ele) => {
    ele.properties.value = AIGeneratedResponse[ele.key];
    return ele;
  });
};

const handleAnswerAnalysis = async ({ userAssessmentQuestionId, userId }) => {
  try {
    /*
        1: Try to get question if interview is completed and is answered if not throw error it is not answered.
        2: If the feedback already exists in table return that. Else follow from step 3.
        3: We have question builder prompt, question, and answer.
        4: Now we use AIService to build the detailed feedback according to the response structure we need 
        Prompt, AI Response Structure, Response Structure to store in database.
        5: After detailed feedback is generated store it into a table.
         */
    logger.info("Starting handleAssessmentReport process", {
      userAssessmentQuestionId,
      userId,
    });

    const userCapping = await userInterviewCappingCheck(userId);

    if(userCapping && !userCapping.hasAnswerAnalysis) {

      logger.warn("User has no access to answer analysis", {
        userId,
        userCapping,
      });

      return {
        Error: true,
        message: 'API Failed! You do not have access to answer analysis.',
        status: 402,
      };
    }

    const userAnswer = await getUserAssessmentQuestionAnswer(
      userId,
      userAssessmentQuestionId
    );

    if (userAnswer.answerAnalysisObject) {
      return {
        Error: false,
        message: "API Success! Analysis for the given question!",
        data: userAnswer.answerAnalysisObject,
      };
    }

    const assessmentQuestionContext = await getFullInterviewContext(
      userAnswer.userAssessmentId,
      userId,
      INTERVIEW_STATUSES.IN_PROGRESS
    );
    if (!userAnswer)
      return {
        Error: true,
        message: "API Failed! Could find answer for question",
        status: 400,
      };

    const questionPrompt = buildPromptFromContext({
      prompt: assessmentQuestionContext.prompt_template_content,
      preDefinedProperties: assessmentQuestionContext.meta_question_props,
      userDefinedProperties: assessmentQuestionContext.question_user_properties,
      propertiesArray: assessmentQuestionContext.prompt_template_properties,
    });

    const answerAnalysisPrompt = buildPromptFromContext({
      prompt: assessmentQuestionContext.answerAnalysisPromptTemplateContent,
      preDefinedProperties: {
        questionPrompt,
        question: userAnswer.questionObject,
        answer: userAnswer.answerObject,
      },
      userDefinedProperties: {},
      propertiesArray:
        assessmentQuestionContext.answerAnalysisPromptTemplateProperties,
    });

    const Engine = await AIService.getEngine(
      assessmentQuestionContext.answerAnalysisAIEngineType
    );
    let result = await Engine.generateContent({
      responseSchema:
        assessmentQuestionContext.answerAnalysisPromptResponseStructureContent,
      prompt: answerAnalysisPrompt,
    });
    logger.info("Generated feedback", { result: result.text });
    result = JSON.parse(result.text);

    const mappedAnswerAnalysis = AIResponseMapper(
      result,
      assessmentQuestionContext.answerAnalysisPromptResponseStructure
    );

    const storeEvaluationResponse = await insertUserAssessmentAnswerEvaluation({
      interviewResponseId: userAnswer.answerId,
      feedbackObject: mappedAnswerAnalysis,
    });

    return {
      Error: false,
      message: "API Success! Analysis for the given question!",
      data: mappedAnswerAnalysis,
    };
  } catch (error) {
    logError(error, __filename, { userAssessmentQuestionId });
    throw error; // Let the global error handler handle it
  }
};

module.exports = handleAnswerAnalysis;
