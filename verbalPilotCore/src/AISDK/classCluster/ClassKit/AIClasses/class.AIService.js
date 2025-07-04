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
}

module.exports = new AIService();
