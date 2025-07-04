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

const prompt = "List a few popular cookie recipes, and include the amounts of ingredients.";

const runPrompt = async () => {
    try {
        const geminiEngine = await AIService.getEngine('gemini', {
            responseSchema,
            prompt,
        });

        const result = await geminiEngine.generateContent({
            prompt,
            responseSchema,
        });
        console.log("Generated content:", result.text);
    } catch (error) {
        console.error("Error generating content:", error);
    }
};

runPrompt();