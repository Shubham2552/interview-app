const AIEngineCore = require('./class.AIEngine');
const { GoogleGenAI } = require('@google/genai');
const { GEMINI_MODELS } = require('./constants');
require('dotenv').config(); // Load environment variables from .env file
/*
config properties:
- apiKey: string (Google API key for Gemini)
- modelName: string (optional, defaults to 'gemini-pro')
- responseSchema: string or function (optional, defaults to 'text')
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
        return await this.gemini.models.generateContent({
            model: this.modelName,
            contents: this.prompt,
            ...(this.responseSchema ? { config: this.responseSchema } : {})
        });
    }
}

module.exports = GeminiEngine;
