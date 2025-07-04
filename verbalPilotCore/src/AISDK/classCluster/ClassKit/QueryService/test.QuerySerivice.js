const QueryEngineCore = require('./class.QueryEngine');

async function main() {
    const QueryEngineObject = new QueryEngineCore({
        template: null,
        templateProperties: {},
        history: [],
        responseSchema: null,
        prompt: null,
        AIEngine: 'gemini',
        modelName: null,
    });

    await QueryEngineObject.setTemplateValuesById(1);
    console.log('Template and values set successfully');

    QueryEngineObject.inflateTemplate();
    const result = await QueryEngineObject.Runner();
    console.log('Generated response:', result.text);

    // If you want to use GeminiEngine directly:
    /*
    const geminiEngine = await QueryEngineObject.AIService.getEngine('gemini', {
        responseSchema: QueryEngineObject.responseSchema,
        prompt: QueryEngineObject.prompt,
    });

    const geminiResult = await geminiEngine.generateContent({
        prompt: QueryEngineObject.prompt,
        responseSchema: QueryEngineObject.responseSchema,
    });
    console.log('Gemini generated content:', geminiResult);
    */
}

main().catch(console.error);