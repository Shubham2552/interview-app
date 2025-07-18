const AIEngineCore = require('./class.AIEngine');
const { GoogleGenAI } = require('@google/genai');
const { GEMINI_MODELS } = require('./constants');
const { Type } = require('@google/genai');
require('dotenv').config(); // Load environment variables from .env file
/*
config properties:
- apiKey: string (Google API key for Gemini)
- modelName: string (optional, defaults to 'gemini-pro')
- responseSchema: string or function (optional, defaults to 'text')
- QuestionPrompt: string
- QuestionProps: object
- History: string array
*/

class GeminiEngine extends AIEngineCore {

    constructor(config) {
        super(config);
        if (config && typeof config === 'object') {
            console.log("GeminiEngine initialized with config:", config);
            this.apiKey = config.apiKey || process.env.GEMINI_API_KEY;
            this.modelName = config.modelName || GEMINI_MODELS.FLASH_2DOT5; // Default to 'gemini-2.5-flash'
            this.responseSchema = config.responseSchema || null;
            this.prompt = config.prompt || null;
            this.history = config.history || [];
        } else {
            this.setDefaultConfig();
        }
        this.gemini = null;
        }

        setDefaultConfig() {
        console.log("GeminiEngine initialized with default config.");
        this.apiKey = process.env.GEMINI_API_KEY;
        this.modelName = GEMINI_MODELS.FLASH_2DOT5;
        this.responseSchema = null;
        this.prompt = null;
        this.history = [];
    }

    /**
     * Maps string type representations to actual Google GenAI Type objects
     * @param {Object} schema - The schema object with string type representations
     * @returns {Object} - The schema object with actual Type objects
     */
    mapTypesToGoogleTypes(schema) {
        if (!schema || typeof schema !== 'object') {
            return schema;
        }

        // Create a deep copy to avoid mutating the original
        const mappedSchema = JSON.parse(JSON.stringify(schema));

        const typeMapping = {
            'Type.STRING': Type.STRING,
            'Type.OBJECT': Type.OBJECT,
            'Type.ARRAY': Type.ARRAY,
            'Type.NUMBER': Type.NUMBER,
            'Type.INTEGER': Type.INTEGER,
            'Type.BOOLEAN': Type.BOOLEAN
        };

        const mapTypes = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(item => mapTypes(item));
            }
            
            if (obj && typeof obj === 'object') {
                const result = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (key === 'type' && typeof value === 'string' && typeMapping[value]) {
                        result[key] = typeMapping[value];
                    } else if (typeof value === 'object') {
                        result[key] = mapTypes(value);
                    } else {
                        result[key] = value;
                    }
                }
                return result;
            }
            
            return obj;
        };

        return mapTypes(mappedSchema);
    }

    /**
     * Processes the response schema to convert string types to Google GenAI types
     * @param {Object} responseSchema - The response schema object
     * @returns {Object} - The processed schema with actual Type objects
     */
    processResponseSchema(responseSchema) {
        if (!responseSchema) {
            return null;
        }

        console.log("Original response schema:", JSON.stringify(responseSchema, null, 2));
        const processedSchema = this.mapTypesToGoogleTypes(responseSchema);
        console.log("Processed response schema:", JSON.stringify(processedSchema, null, 2));
        
        return processedSchema;
    }

    async initialize(params = {}) {
        console.log("Initializing GeminiEngine with params:", params);
        console.log("Using API Key:", this.apiKey);
        this.gemini = new GoogleGenAI({ apiKey: this.apiKey }); // ✅ FIXED here
        this.prompt = params.prompt || this.prompt;
        this.responseSchema = params.responseSchema || this.responseSchema;
        this.history = params.history || this.history;
    }

    async generateContent(params) {
        await this.initialize({ prompt: params.prompt, responseSchema: params.responseSchema, history: params.history });           
        console.log("Generating content with model:", this.modelName);
        console.log("Using response schema:", this.responseSchema);
        
        // Process the response schema to convert string types to actual Google types
        const processedSchema = this.processResponseSchema(this.responseSchema);
        
        return await this.gemini.models.generateContent({
            model: this.modelName,
            contents: this.prompt,
            ...(processedSchema ? { config: processedSchema } : {})
        });
    }
}

module.exports = GeminiEngine;
