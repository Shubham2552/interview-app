const engines = {
    openai: require('./class.OpenAIEngine'),
    gemini: require('./class.GeminiEngine'),
};

class AIService {
    constructor() {
        this.instances = {};
    }

    /**
     * Initialize and get an AI engine instance.
     * @param {string} provider - e.g. 'openai' or 'gemini'
     * @param {object} config - engine-specific config
     * @returns {Promise<AIEngineCore>}
     */
    async getEngine(provider, config = {}) {
        const EngineClass = engines[provider];
        if (!EngineClass) throw new Error(`Unknown AI provider: ${provider}`);

        if (!this.instances[provider]) {
            const engine = new EngineClass(config);
            this.instances[provider] = engine;
        }

        return this.instances[provider];
    }

    /**
     * Shortcut: Directly get content from provider
     * @param {string} provider
     * @param {object} config
     * @param {object} params
     * @returns {Promise<any>}
     */
    async generateContent(provider, config, params) {
        const engine = await this.getEngine(provider, config);
        return engine.generateContent(params);
    }

    populatePromptTemplate(prompt, props) {
        if (!prompt || !props) {
            throw new Error('Prompt and properties must be provided');
        }

        let populatedPrompt = prompt;
        for (const [key, value] of Object.entries(props)) {
            let replacementValue = value;
            if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object') {
                    // Array of objects: convert to pretty JSON string
                    replacementValue = JSON.stringify(value, null, 2);
                } else {
                    // Array of primitives: join as comma-separated
                    replacementValue = value.join(', ');
                }
            } else if (typeof value === 'object' && value !== null) {
                // Single object: convert to pretty JSON string
                replacementValue = JSON.stringify(value, null, 2);
            }
            const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            populatedPrompt = populatedPrompt.replace(placeholder, replacementValue);
        }
        console.log('Populated Prompt:', { populatedPrompt });
        return populatedPrompt;
    }
}

module.exports = new AIService();
