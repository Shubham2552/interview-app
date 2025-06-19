class InsightEngineCore {
    constructor(config = {}) {
        this.config = config;
    }

    async analyzeResponse(params) {
        throw new Error('analyzeResponse() must be implemented by subclass');
    }
}
module.exports = InsightEngineCore;
