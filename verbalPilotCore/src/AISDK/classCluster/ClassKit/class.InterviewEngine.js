const QueryEngine = require('./class.QueryEngine')
const InsightEngineCore = require('./class.InsightEngine');
const UserGroupCore = require('./class.UserGroupEngine')
class InterviewEngineCore {


    constructor(config = {}) {
        this.config = config;
    }

    async createInterview(params) {
        throw new Error('createInterview() must be implemented by subclass');
    }

    async getInterview(params) {
        throw new Error('getInterview() must be implemented by subclass');
    }
}
module.exports = InterviewEngineCore;