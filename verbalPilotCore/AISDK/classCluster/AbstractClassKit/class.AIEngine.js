// AIEngineCore.js

class AIEngineCore {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Initialize the engine or provider.
     * Override in subclass if needed.
     */
    async initialize() {
        throw new Error('initialize() must be implemented by subclass');
    }

    /**
     * Generate content from the AI model.
     * @param {Object} params
     * @returns {Promise<any>}
     */
    async generateContent(params) {
        throw new Error('generateContent() must be implemented by subclass');
    }

    /**
     * (Optional) Set or update configuration at runtime.
     * @param {Object} config
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}

module.exports