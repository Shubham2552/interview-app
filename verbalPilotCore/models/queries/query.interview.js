const {
  QUESTION_STATUS,
  INTERVIEW_STATUSES,
} = require("../../src/constant/genericConstants/commonConstant");
const { pgQuery, pgPool } = require("../index");

async function getAvailableInterviews(userId) {
  const query = `
        SELECT DISTINCT 
        io.id as id,
        io.display_name as name,
        io.is_active as "isActive",
        io.description
        FROM interview_object io
        JOIN interview_object_user_group_mapping iougm
            ON io.id = iougm.interview_object_id
        JOIN user_group ug
            ON ug.id = iougm.user_group_id
        JOIN user_group_mapping ugm
            ON ug.id = ugm.group_id
        JOIN users u
            ON u.id = ugm.user_id
        JOIN user_meta um
            ON um.user_id = u.id
        WHERE ugm.user_id = $1
          -- Interview object checks
          AND io.is_active = TRUE
          AND io.is_deleted = FALSE
          -- Mappings and group checks
          AND iougm.is_active = TRUE AND iougm.is_deleted = FALSE
          AND ug.is_active = TRUE AND ug.is_deleted = FALSE
          AND ugm.is_active = TRUE AND ugm.is_deleted = FALSE
          -- User and user_meta checks
          AND um.is_active = TRUE AND um.is_deleted = FALSE
    `;
  const { rows } = await pgQuery(query, [userId]);
  return rows;
}

async function getInterviewObjectMeta(userId, interviewObjectId) {
  const query = `
        SELECT DISTINCT 
        io.id as id,
        io.name as name,
        io.display_name as "displayName",
        io.is_active as "isActive",
        io.description,
        c.id as "categoryId",
        c.name as "categoryName",
        iom.id as "metaId",
        iom.name as "metaName",
        iom.display_name as "metaDisplayName",
        iom.description as "metaDescription",
        iom.question_prompt_user_input_properties as "questionProperties",
        iom.answer_prompt_user_input_properties as "answerProperties"
        FROM interview_object io
        JOIN interview_object_user_group_mapping iougm
            ON io.id = iougm.interview_object_id
        JOIN user_group ug
            ON ug.id = iougm.user_group_id
        JOIN user_group_mapping ugm
            ON ug.id = ugm.group_id
        JOIN users u
            ON u.id = ugm.user_id
        JOIN user_meta um
            ON um.user_id = u.id
        LEFT JOIN category c
            ON io.category_id = c.id
        LEFT JOIN interview_object_meta iom
            ON io.interview_object_meta_id = iom.id
        WHERE ugm.user_id = $1
          AND io.id = $2
          -- Interview object checks
          AND io.is_active = TRUE
          AND io.is_deleted = FALSE
          -- Mappings and group checks
          AND iougm.is_active = TRUE AND iougm.is_deleted = FALSE
          AND ug.is_active = TRUE AND ug.is_deleted = FALSE
          AND ugm.is_active = TRUE AND ugm.is_deleted = FALSE
          -- User and user_meta checks
          AND um.is_active = TRUE AND um.is_deleted = FALSE
        LIMIT 1
    `;
  const { rows } = await pgQuery(query, [userId, interviewObjectId]);
  return rows[0] || null;
}

async function checkUserInterviewAccess(userId, interviewObjectId) {
  const query = `
        SELECT iom.is_synced as "isSynced"
        FROM interview_object io
        JOIN interview_object_meta iom on io.interview_object_meta_id = iom.id
        JOIN interview_object_user_group_mapping iougm
            ON io.id = iougm.interview_object_id
        JOIN user_group ug
            ON ug.id = iougm.user_group_id
        JOIN user_group_mapping ugm
            ON ug.id = ugm.group_id
        JOIN users u
            ON u.id = ugm.user_id
        JOIN user_meta um
            ON um.user_id = u.id
        WHERE ugm.user_id = $1
          AND io.id = $2
          -- Interview object checks
          AND io.is_active = TRUE
          AND io.is_deleted = FALSE
          -- Mappings and group checks
          AND iougm.is_active = TRUE AND iougm.is_deleted = FALSE
          AND ug.is_active = TRUE AND ug.is_deleted = FALSE
          AND ugm.is_active = TRUE AND ugm.is_deleted = FALSE
          -- User and user_meta checks
          AND um.is_active = TRUE AND um.is_deleted = FALSE
    `;
  const { rows } = await pgQuery(query, [userId, interviewObjectId]);
  return rows[0];
}

async function getUserInterviewsByStatus(userId, status) {
  const query = `
        SELECT 
        ui.id as "userInterviewId",
        ui.interview_object_id as "interviewObjectId",
        ui.user_id as "userId",
        ui.created_at as "createdAt",
        ui.updated_at as "updatedAt",
        ui.is_active as "isActive",
        uim.id as "userInterviewMetaId",
        uim.status,
        uim.question_user_properties as "questionProperties",
        uim.answer_user_properties as "answerProperties",
        uim.created_at as "metaCreatedAt",
        uim.updated_at as "metaUpdatedAt",
        io.name as "interviewName",
        io.display_name as "interviewDisplayName",
        io.description as "interviewDescription"
        FROM user_interviews ui
        JOIN user_interview_meta uim
            ON ui.id = uim.user_interview_id
        JOIN interview_object io
            ON ui.interview_object_id = io.id
        WHERE ui.user_id = $1
          AND uim.status = $2
          AND ui.is_active = TRUE
          AND ui.is_deleted = FALSE
          AND uim.is_active = TRUE
          AND uim.is_deleted = FALSE
        ORDER BY ui.created_at DESC
    `;
  const { rows } = await pgQuery(query, [userId, status.toUpperCase()]);
  return rows;
}

async function createUserInterviewWithMeta({
  interviewObjectId,
  userId,
  questionProperties = {},
  answerProperties = {},
  status = "in_progress",
  cycleId, // new parameter
}) {
  const client = await pgPool.connect();

  try {
    await client.query("BEGIN");

    // 1. Create UserInterview
    const userInterviewQuery = `
            INSERT INTO user_interviews (interview_object_id, user_id, is_active, is_deleted)
            VALUES ($1, $2, TRUE, FALSE)
            RETURNING *
        `;
    const userInterviewResult = await client.query(userInterviewQuery, [
      interviewObjectId,
      userId,
    ]);
    const userInterview = userInterviewResult.rows[0];

    // 2. Create UserInterviewMeta
    const userInterviewMetaQuery = `
            INSERT INTO user_interview_meta (
                user_interview_id, 
                question_user_properties, 
                answer_user_properties, 
                status, 
                is_active, 
                is_deleted
            )
            VALUES ($1, $2, $3, $4, TRUE, FALSE)
            RETURNING *
        `;
    const userInterviewMetaResult = await client.query(userInterviewMetaQuery, [
      userInterview.id,
      JSON.stringify(questionProperties),
      JSON.stringify(answerProperties),
      status,
    ]);
    const userInterviewMeta = userInterviewMetaResult.rows[0];

    // 3. Increment used_count in user_subscription_cycles if cycleId is provided
    if (cycleId) {
      const updateCycleQuery = `
                UPDATE user_subscription_cycles
                SET used_count = used_count + 1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *;
            `;
      await client.query(updateCycleQuery, [cycleId]);
    }

    await client.query("COMMIT");

    return {
      userInterview,
      userInterviewMeta,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getInterviewWithCategoryAndMeta(interviewId) {
  const query = `
        SELECT io.*, c.name as category_name, iom.*
        FROM interview_object io
        LEFT JOIN category c ON io.category_id = c.id
        LEFT JOIN interview_object_meta iom ON io.interview_object_meta_id = iom.id
        WHERE io.id = $1
          AND io.is_active = TRUE
          AND io.is_deleted = FALSE
    `;
  const { rows } = await pgQuery(query, [interviewId]);
  return rows[0] || null;
}

async function getLatestUserInterviewQuestion(userInterviewId) {
  const query = `
        SELECT * FROM user_interview_questions uiq
        WHERE uiq.user_interview_id = $1
          AND status='${QUESTION_STATUS.UNANSWERED}'
          AND is_active = TRUE
          AND is_deleted = FALSE
          ORDER BY uiq.id
        LIMIT 1
    `;
  const { rows } = await pgQuery(query, [userInterviewId]);
  return rows[0] || null;
}

async function getAnswerForQuestion(questionId) {
  const query = `
        SELECT * FROM user_interview_answers
        WHERE interview_question_id = $1
          AND is_active = TRUE
          AND is_deleted = FALSE
        ORDER BY id DESC
        LIMIT 1
    `;
  const { rows } = await pgQuery(query, [questionId]);
  return rows[0] || null;
}

async function insertUserInterviewQuestion(userInterviewId, questionObject) {
  let insertValues = "($1, $2)";
  let queryArguments = [userInterviewId, questionObject];

  if (Array.isArray(questionObject)) {
    let i = 1;
    insertValues = questionObject
      .map((ele, idx) => {
        return `($${i++},$${i++})`;
      })
      .join(",");

    queryArguments = questionObject.reduce((prevVal, currVal) => {
      prevVal.push(userInterviewId);
      prevVal.push(currVal);
      return prevVal;
    }, []);
  }

  const query = `
        INSERT INTO user_interview_questions (user_interview_id, question_object) VALUES
        ${insertValues}
        RETURNING *
    `;
  const { rows } = await pgQuery(query, queryArguments);
  return rows[0];
}

// Keep the original getFullInterviewContext
async function getFullInterviewContext(
  userInterviewId,
  userId,
  status = INTERVIEW_STATUSES.COMPLETED
) {
  const query = `
        SELECT
            ui.id AS user_interview_id,
            uim.id AS user_interview_meta_id,
            uim.status AS interview_status,
            uim.question_user_properties AS question_user_properties,
            io.id AS interview_object_id,
            io.name AS interview_object_name,
            io.display_name AS interview_object_display_name,
            io.description AS interview_object_description,
            iom.id AS interview_object_meta_id,
            iom.name AS interview_object_meta_name,
            iom.display_name AS interview_object_meta_display_name,
            iom.description AS interview_object_meta_description,
            iom.pre_defined_question_prompt_values AS meta_question_props,
            ic.id AS interview_class_id,
            ic.question_prompt_response_structure_id,

            prs.id AS prompt_response_structure_id,
            prs.structure_type AS prompt_response_structure_type,
            prs.structure_content AS prompt_response_structure_content,
            prs.response_structure AS "questionBody",

            p.id AS prompt_id,
            p.template_content AS prompt_template_content,
            p.template_properties AS prompt_template_properties,

            aie.id AS ai_engine_id,
            aie.engine_type AS ai_engine_type,
            aie.engine_model AS ai_engine_model,

            aie2.id AS "answerAnalysisAIEngineId",
            aie2.engine_type AS "answerAnalysisAIEngineType",
            aie2.engine_model AS "answerAnalysisAIEngineModel",

            p2.id AS "answerAnalysisPromptId",
            p2.template_content AS "answerAnalysisPromptTemplateContent",
            p2.template_properties AS "answerAnalysisPromptTemplateProperties",

            prs2.id AS "answerAnalysisPromptResponseStructureId",
            prs2.structure_type AS "answerAnalysisPromptResponseStructureType",
            prs2.structure_content AS "answerAnalysisPromptResponseStructureContent",
            prs2.response_structure AS "answerAnalysisPromptResponseStructure"

        FROM user_interviews ui
        JOIN user_interview_meta uim ON ui.id = uim.user_interview_id
        JOIN interview_object io ON ui.interview_object_id = io.id
        LEFT JOIN interview_object_meta iom ON io.interview_object_meta_id = iom.id
        LEFT JOIN interview_class ic ON io.interview_class_id = ic.id

        LEFT JOIN prompt_response_structures prs ON ic.question_prompt_response_structure_id = prs.id
        LEFT JOIN prompts p ON ic.question_prompt_id = p.id
        LEFT JOIN ai_engine aie ON ic.question_ai_engine_id = aie.id

        JOIN ai_engine aie2 ON ic.answer_analysis_ai_engine_id = aie2.id
        JOIN prompts p2 ON ic.answer_analysis_prompt_id = p2.id
        JOIN prompt_response_structures prs2 ON ic.answer_analysis_response_structure_id = prs2.id


        WHERE ui.id = $1
          AND ui.user_id = $2
          AND ui.is_active = TRUE
          AND ui.is_deleted = FALSE
          AND uim.is_active = TRUE
          AND uim.is_deleted = FALSE
          AND io.is_active = TRUE
          AND io.is_deleted = FALSE
          AND uim.status <> $3
        LIMIT 1
    `;
  const { rows } = await pgQuery(query, [userInterviewId, userId, status]);
  return rows[0] || null;
}

// Add the new getFullResponseInterviewContext as a separate function
async function getFullResponseInterviewContext(
  userInterviewId,
  userId,
  status = INTERVIEW_STATUSES.COMPLETED
) {
  const query = `
       SELECT
            ui.id AS user_interview_id,
            uim.id AS user_interview_meta_id,
            uim.status AS interview_status,
            uim.answer_user_properties AS "feedbackUserProperties",
            io.id AS interview_object_id,
            io.name AS interview_object_name,
            io.display_name AS interview_object_display_name,
            io.description AS interview_object_description,
            iom.id AS interview_object_meta_id,
            iom.name AS interview_object_meta_name,
            iom.display_name AS interview_object_meta_display_name,
            iom.description AS interview_object_meta_description,
            iom.pre_defined_answer_prompt_values AS "feedbackPreDefinedObject",
            ic.id AS interview_class_id,

            -- Question prompt and response
            p.id AS "feedbackPromptId",
            p.template_content AS "feedbackTemplate",
            p.template_properties AS "feedbackTemplateProperties",

            -- Answer AI engine
            aie.id AS "feedbackAIEngineId",
            aie.engine_type AS "feedbackAIEngineType",
            aie.engine_model AS "feedbackAIEngineModel",



            -- Response structure (Answer)
            prs_a.id AS "feedbackResponseStructureId",
            prs_a.structure_type AS "feedbackResponseStructureType",
            prs_a.structure_content AS "feedbackResponseStructureContent",
            prs_a.response_structure AS "feedbackResponseStructureObject"

        FROM user_interviews ui
        JOIN user_interview_meta uim ON ui.id = uim.user_interview_id
        JOIN interview_object io ON ui.interview_object_id = io.id
        LEFT JOIN interview_object_meta iom ON io.interview_object_meta_id = iom.id
        LEFT JOIN interview_class ic ON io.interview_class_id = ic.id
        LEFT JOIN prompts p ON ic.answer_prompt_id = p.id
        LEFT JOIN ai_engine aie ON ic.answer_ai_engine_id = aie.id


        -- Join answer response structure
        LEFT JOIN prompt_response_structures prs_a ON ic.answer_prompt_response_structure_id = prs_a.id

        WHERE ui.id = $1
          AND ui.user_id = $2
          AND ui.is_active = TRUE
          AND ui.is_deleted = FALSE
          AND uim.is_active = TRUE
          AND uim.is_deleted = FALSE
          AND io.is_active = TRUE
          AND io.is_deleted = FALSE
          AND uim.status <> $3
        LIMIT 1
    `;
  const { rows } = await pgQuery(query, [
    parseInt(userInterviewId),
    userId,
    status,
  ]);
  return rows[0] || null;
}

async function insertUserInterviewAnswer({
  interviewQuestionId,
  answerObject,
}) {
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");

    // 1. Insert the answer
    const insertAnswerQuery = `
            INSERT INTO user_interview_answers (interview_question_id, answer_object)
            VALUES ($1, $2)
            RETURNING *
        `;
    const answerResult = await client.query(insertAnswerQuery, [
      interviewQuestionId,
      JSON.stringify(answerObject),
    ]);
    const insertedAnswer = answerResult.rows[0];

    // 2. Update the question status to 'answered'
    const updateStatusQuery = `
            UPDATE user_interview_questions
            SET status = 'ANSWERED'
            WHERE id = $1
        `;
    await client.query(updateStatusQuery, [interviewQuestionId]);

    await client.query("COMMIT");
    return insertedAnswer;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getAllInterviewQuestions(userInterviewId) {
  const query = `
    SELECT * FROM user_interview_questions
    WHERE user_interview_id = $1
      AND is_active = TRUE
      AND is_deleted = FALSE
    ORDER BY id DESC`;
  const { rows } = await pgQuery(query, [userInterviewId]);
  return rows || [];
}

/**
 * Insert feedback for a user interview response.
 * @param {Object} params
 * @param {number} params.interviewResponseId - The ID of the user_interview_answers row.
 * @param {Object} params.feedbackObject - The feedback object to store (will be stringified to JSON).
 * @returns {Promise<Object>} The inserted feedback row.
 */
async function insertUserAssessmentAnswerEvaluation({
  interviewResponseId,
  feedbackObject,
}) {
  const query = `
        INSERT INTO user_interview_responses_feedback (interview_response_id, feedback_object)
        VALUES ($1, $2)
        RETURNING *
    `;
  const { rows } = await pgQuery(query, [
    interviewResponseId,
    JSON.stringify(feedbackObject),
  ]);
  return rows[0];
}

async function endInterviewQuery(userInterviewId, userId, isTabSwitch) {
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");

    let updatedRow = null;

    // 1. Update user_interview_meta to 'COMPLETED' if not already
    const updateQuery = `
            UPDATE user_interview_meta
            SET status = 'COMPLETED'
            WHERE user_interview_id = $1
              AND status != 'COMPLETED'
              AND EXISTS (
                  SELECT 1
                  FROM user_interviews ui
                  WHERE ui.id = $1
                    AND ui.user_id = $2
              )
            RETURNING *;
        `;
    const { rows } = await client.query(updateQuery, [userInterviewId, userId]);
    updatedRow = rows[0] || null;

    // 2. Only insert tab switch info if interview was valid and marked completed, and isTabSwitch is true
    if (updatedRow && isTabSwitch) {
      const insertTabSwitchQuery = `
                INSERT INTO user_tab_switch_info (
                    user_id,
                    user_interview_id,
                    is_active,
                    is_deleted,
                    switch_type
                ) VALUES ($1, $2, TRUE, FALSE, 'TAB_SWITCH_SUBMIT')
                RETURNING *;
            `;
      await client.query(insertTabSwitchQuery, [userId, userInterviewId]);
    }

    await client.query("COMMIT");
    return updatedRow;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function insertTabSwitch(userInterviewId, userId) {
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");

    // Check if the interview is valid, belongs to the user, and is IN_PROGRESS
    const interviewCheckQuery = `
            SELECT uim.status
            FROM user_interview_meta uim
            INNER JOIN user_interviews ui ON ui.id = uim.user_interview_id
            WHERE uim.user_interview_id = $1
              AND ui.user_id = $2
              AND ui.is_active = TRUE
              AND ui.is_deleted = FALSE
              AND uim.is_active = TRUE
              AND uim.is_deleted = FALSE
            LIMIT 1;
        `;
    const interviewCheckResult = await client.query(interviewCheckQuery, [
      userInterviewId,
      userId,
    ]);
    const status = interviewCheckResult.rows[0]?.status;

    if (!status) {
      await client.query("ROLLBACK");
      throw new Error("Invalid interview or user does not have access.");
    }
    if (status !== "IN_PROGRESS") {
      await client.query("ROLLBACK");
      throw new Error(
        "Tab switch is only allowed for interviews that are IN_PROGRESS."
      );
    }

    // Insert a new tab switch entry
    const insertTabSwitchQuery = `
            INSERT INTO user_tab_switch_info (
                user_id,
                user_interview_id,
                is_active,
                is_deleted,
                switch_type
            ) VALUES ($1, $2, TRUE, FALSE, 'TAB_SWITCH')
            RETURNING *;
        `;
    await client.query(insertTabSwitchQuery, [userId, userInterviewId]);

    // Get the total count of tab switches for this user and interview
    const countTabSwitchQuery = `
            SELECT COUNT(*) AS total
            FROM user_tab_switch_info
            WHERE user_id = $1
              AND user_interview_id = $2
              AND is_deleted = FALSE
              AND is_active = TRUE
              AND switch_type = 'TAB_SWITCH';
        `;
    const { rows } = await client.query(countTabSwitchQuery, [
      userId,
      userInterviewId,
    ]);
    const totalTabSwitches = rows[0] ? parseInt(rows[0].total, 10) : 0;

    await client.query("COMMIT");
    return { totalTabSwitches };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function userInterviewResult(userInterviewId, userId) {
  const query = `
    SELECT ui.id,
       uiq.id AS "questionId",
       uiq.question_object,
       uia.answer_object
        FROM user_interviews ui
            JOIN user_interview_questions uiq on ui.id = uiq.user_interview_id
            JOIN user_interview_answers uia on uiq.id = uia.interview_question_id
        WHERE ui.id = $1
        AND ui.user_id = $2
        AND ui.is_active = true
        AND ui.is_deleted = false
        AND uiq.is_active = true
        AND uiq.is_deleted = false
        AND uia.is_active = true
        AND uia.is_deleted = false;
        `;

  const { rows } = await pgQuery(query, [userInterviewId, userId]);
  return rows;
}

async function userInterviewCappingCheck(userId) {
  const query = `
        SELECT 
            m.id                AS master_subscription_id,
            m.user_id,
            m.plan_id,
            p.display_name      AS plan_name,
            p.user_interview_capping as "userInterviewCapping",
            p.has_answer_analysis as "hasAnswerAnalysis",
            c.id                AS "cycleId",
            c.cycle_start,
            c.cycle_end,
            COUNT(ui.id)        AS "usedCount",
            (p.user_interview_capping - COUNT(ui.id)) AS remaining_interviews
        FROM user_master_subscriptions m
        JOIN user_interview_plans p
            ON m.plan_id = p.id
        JOIN user_subscription_cycles c
            ON c.master_subscription_id = m.id
        LEFT JOIN user_interviews ui
            ON ui.user_id = m.user_id
           AND ui.created_at::date BETWEEN c.cycle_start AND c.cycle_end
        WHERE m.user_id = $1
          AND m.status = 'ACTIVE'
          AND CURRENT_DATE BETWEEN m.start_date AND m.end_date
          AND CURRENT_DATE BETWEEN c.cycle_start AND c.cycle_end
        GROUP BY 
            m.id, m.user_id, m.plan_id, p.display_name, p.user_interview_capping, 
            c.id, c.cycle_start, c.cycle_end, p.has_answer_analysis;
    `;
  const { rows } = await pgQuery(query, [userId]);
  return rows[0] || null;
}

async function interviewUserProperties(userId, userInterviewId) {
  const query = `
        SELECT 
            ui.id, 
            iom.display_name, 
            iom.description, 
            uim.question_user_properties, 
            uim.answer_user_properties, 
            iom.question_prompt_user_input_properties, 
            iom.answer_prompt_user_input_properties
        FROM user_interviews ui
        INNER JOIN user_interview_meta uim ON ui.id = uim.user_interview_id
        INNER JOIN interview_object io ON ui.interview_object_id = io.id
        INNER JOIN interview_object_meta iom ON io.interview_object_meta_id = iom.id
        WHERE ui.user_id = $1
          AND ui.id = $2
          AND ui.is_active = TRUE AND ui.is_deleted = FALSE
          AND uim.is_active = TRUE AND uim.is_deleted = FALSE
          AND io.is_active = TRUE AND io.is_deleted = FALSE
          AND iom.is_active = TRUE AND iom.is_deleted = FALSE
    `;
  const { rows } = await pgQuery(query, [userId, userInterviewId]);
  return rows[0] || null;
}

async function userInterviewQuestionCappingCheck(userId, userInterviewId) {
  const query = `
        SELECT 
            COUNT(uiq.id) AS total_interview_questions,
            ui.user_id,
            p.interview_question_capping
        FROM user_interview_questions uiq
        INNER JOIN user_interviews ui 
            ON uiq.user_interview_id = ui.id
        INNER JOIN user_master_subscriptions ms
            ON ms.user_id = ui.user_id
           AND ms.status = 'ACTIVE'
           AND CURRENT_DATE BETWEEN ms.start_date AND ms.end_date
        INNER JOIN user_interview_plans p
            ON ms.plan_id = p.id
        WHERE ui.user_id = $1
          AND uiq.user_interview_id = $2
          AND ui.is_active = TRUE
          AND ui.is_deleted = FALSE
          AND uiq.is_active = TRUE
          AND uiq.is_deleted = FALSE
        GROUP BY p.interview_question_capping, ui.user_id;
    `;
  const { rows } = await pgQuery(query, [userId, userInterviewId]);
  return rows[0] || null;
}

async function skipUserInterviewQuestion(questionId) {
  const query = `
        UPDATE user_interview_questions
        SET status = 'SKIPPED'
        WHERE id = $1
        RETURNING *;
    `;
  const { rows } = await pgQuery(query, [questionId]);
  return rows[0] || null;
}

async function getIsSyncedFromUserInterview(UserId, userInterviewId) {
  const query = `
        SELECT iom.is_synced as "isSynced"
            FROM user_interviews ui
                JOIN interview_object io ON ui.interview_object_id = io.id
                JOIN interview_object_meta iom ON io.interview_object_meta_id = iom.id
            WHERE ui.user_id = $1 AND ui.id = $2;

    `;
  const { rows } = await pgQuery(query, [UserId, userInterviewId]);
  return rows[0] || null;
}

async function getQuestionStatus(questionId) {
  const query = `SELECT * FROM user_interview_questions uiq WHERE uiq.id = $1 and status = $2`;

  const { rows } = await pgQuery(query, [
    questionId,
    QUESTION_STATUS.UNANSWERED,
  ]);
  return rows[0] || null;
}

async function AssessmentDataFromUserInterview(userId, userInterviewId) {
  const query = `SELECT
        ui.id as "interviewId",
        uiq.question_object as "questionObject",
        uia.answer_object as "userAnswerObject",
        uiq.status as "questionStatus"
        FROM user_interviews ui
        JOIN public.user_interview_questions uiq
        ON ui.id = uiq.user_interview_id
        LEFT JOIN public.user_interview_answers uia
        ON uiq.id = uia.interview_question_id
        WHERE
        ui.is_active = true AND
        uiq.is_active = true AND
        ui.is_deleted = false AND
        uiq.is_deleted = false AND
        ui.user_id = $1 AND
        ui.id = $2
        `;
  const { rows } = await pgQuery(query, [userId, userInterviewId]);
  return rows || null;
}

async function storeUserAssessment(userInterviewId, assessmentData) {
  const query = `
        INSERT INTO user_assessment_report(user_interview_id, interview_report_object) 
        values($1, $2)
        `;

  const { rows } = await pgQuery(query, [userInterviewId, assessmentData]);
  return rows[0] || null;
}

async function getUserAssessmentReport(userId, userInterviewId) {
  const query = `
    SELECT interview_report_object as "userAssessmentReport"
        FROM user_assessment_report uar
        JOIN user_interviews ui on uar.user_interview_id = ui.id
        WHERE ui.user_id = $1 AND uar.user_interview_id = $2; 
    `;
  const { rows } = await pgQuery(query, [userId, userInterviewId]);
  return rows[0] || null;
}

async function getUserAssessmentQuestionAnswer(
  userId,
  userAssessmentQuestionId
) {
  const query = `SELECT 
                    ui.id AS "userAssessmentId",
                    uiq.id AS "questionId", 
                    uia.id AS "answerId", 
                    uirf.id AS "answerAnalysisId",
                    uiq.status AS "questionStatus",
                    uiq.question_object "questionObject", 
                    uia.answer_object AS "answerObject",
                    uirf.feedback_object AS "answerAnalysisObject"
                    FROM user_interview_questions uiq
                            JOIN user_interview_answers uia ON uiq.id = uia.interview_question_id
                            JOIN user_interviews ui ON uiq.user_interview_id = ui.id
                            JOIN user_interview_meta uim ON ui.id = uim.user_interview_id
                            LEFT JOIN user_interview_responses_feedback uirf ON uia.id = uirf.interview_response_id
                    WHERE ui.user_id = $1
                    AND uiq.id = $2
                    AND uim.status = $3 
                    AND uiq.status = $4;`;
  const { rows } = await pgQuery(query, [
    userId,
    userAssessmentQuestionId,
    INTERVIEW_STATUSES.COMPLETED,
    QUESTION_STATUS.ANSWERED,
  ]);
  return rows[0] || null;
}

module.exports = {
  getAvailableInterviews,
  getInterviewObjectMeta,
  checkUserInterviewAccess,
  getUserInterviewsByStatus,
  createUserInterviewWithMeta,
  getInterviewWithCategoryAndMeta,
  getLatestUserInterviewQuestion,
  getAnswerForQuestion,
  insertUserInterviewQuestion,
  getFullInterviewContext,
  insertUserInterviewAnswer,
  getFullResponseInterviewContext,
  getAllInterviewQuestions,
  insertUserAssessmentAnswerEvaluation,
  endInterviewQuery,
  insertTabSwitch,
  userInterviewResult,
  userInterviewCappingCheck,
  interviewUserProperties,
  userInterviewQuestionCappingCheck,
  skipUserInterviewQuestion,
  getIsSyncedFromUserInterview,
  getQuestionStatus,
  AssessmentDataFromUserInterview,
  storeUserAssessment,
  getUserAssessmentReport,
  getUserAssessmentQuestionAnswer,
};
