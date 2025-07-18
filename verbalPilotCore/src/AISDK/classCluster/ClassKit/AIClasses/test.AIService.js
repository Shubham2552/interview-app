const AIService = require('./class.AIService');
const { Type } = require('@google/genai');

const responseSchema = {
    responseMimeType: "application/json",
    responseSchema: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                recipeName: {
                    type: Type.STRING,
                },
                ingredients: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                },
            },
            propertyOrdering: ["recipeName", "ingredients"],
        },
    },
};


const QuestionSchema = {
    responseMimeType: "application/json",
    responseSchema: {
        type: Type.OBJECT,
        properties: {
            QuestionText: {
                type: Type.STRING
            }
        }
    }
}

const prompt = "List a few popular cookie recipes, and include the amounts of ingredients.";
const QuestionPrompt = "Get a js question for interview";

const runPrompt = async () => {
    try {
        const geminiEngine = await AIService.getEngine('gemini', {
            responseSchema: QuestionSchema,
            prompt: QuestionPrompt,
        });

        let result = await geminiEngine.generateContent({
            responseSchema: QuestionSchema,
            prompt: QuestionPrompt,
        });
        console.log("Type of response: ", typeof result);
        console.log("Generated content:", result.text);
        result = JSON.parse(result.text);
        console.log(result.QuestionText);
    } catch (error) {
        console.error("Error generating content:", error);
    }
};

runPrompt();