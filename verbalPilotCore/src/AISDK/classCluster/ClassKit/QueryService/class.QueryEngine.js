const AIService = require('../AIClasses/class.AIService');
const {Templates, QEPropertyValues } = require('../../../../models');

    //method to set the template
    //method to set the te
    // mplateparameters
    // method to build prompt
    // method to set the response scheme

class QueryEngineCore {

     constructor(params = {}) {
        this.template = params.template || null;
        this.templateProperties =params.templateProperties || {};
        this.history = params.history || [];
        this.responseSchema = params.responseSchema || null;
        this.prompt = null;
        this.AIEngine = params.AIEngine || null;
        this.modelName = params.modelName || null;
        this.AIService = AIService;
    }

    async setTemplateById(templateId) {
        const templateData = await Templates.findOne({
            where: { id: templateId }
        });
        if (!templateData) {
            throw new Error(`Template with ID ${templateId} not found`);
        }
        this.template = templateData.templateContent || null;
    }

    async setTemplateValuesById(templateValuesId) {
        const templateValues = await QEPropertyValues.findOne({
            where: { id: templateValuesId }
        });
        if (!templateValues) {
            throw new Error(`Template values with ID ${templateValuesId} not found`);
        }
        this.templateProperties = templateValues.templateDataValues || {};
        if(!this.template){
            const templateData = await Templates.findOne({
                where: { id: templateValues.templateId }
            });

            this.template = templateData ? templateData.templateContent : null;
        }
    }



    inflateTemplate() {
        // This method should replace placeholders in the template with actual values from templateProperties
        if (!this.template || !this.templateProperties) {
            throw new Error("Template or template properties not set");
        }
        let filledTemplate = this.template;
        for (const [key, value] of Object.entries(this.templateProperties)) {
            const placeholder = `{{${key}}}`;
            filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value);
        }
        this.prompt = filledTemplate;
    }

    async Runner() {
        if (!this.prompt) {
            throw new Error("Prompt is not set. Please inflate the template first.");
        }
        if (!this.AIEngine) {
            throw new Error("AI Engine is not set. Please set the AI Engine before running.");
        }

        const response = await this.AIService.generateContent(this.AIEngine, null ,{
            responseSchema: this.responseSchema,
            prompt: this.prompt,
        });

        return response;
    }
    // Generic invoke method
    invoke(methodName, ...args) {
        if (typeof this[methodName] === 'function') {
            return this[methodName](...args);
        } else {
            throw new Error(`Method ${methodName} does not exist`);
        }
    }
}


module.exports = QueryEngineCore;
