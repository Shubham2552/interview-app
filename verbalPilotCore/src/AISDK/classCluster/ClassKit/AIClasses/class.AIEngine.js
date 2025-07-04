class AIEngineCore {
    constructor(config = {}) {
        this.config = config;
    }

    async initialize() {
        throw new Error('initialize() must be implemented by subclass');
    }

    async generateContent(params) {
        throw new Error('generateContent() must be implemented by subclass');
    }

    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}

module.exports = AIEngineCore;
