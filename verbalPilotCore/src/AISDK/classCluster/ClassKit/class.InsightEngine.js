class InsightEngineCore {
    constructor() {
    }

    async analyzeResponse(params) {
        throw new Error('analyzeResponse() must be implemented by subclass');
    }
}
module.exports = InsightEngineCore;
