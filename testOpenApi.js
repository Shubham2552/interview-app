const { GoogleGenAI } = require("@google/genai");
const fs = require('fs');
const path = require('path');

// Load class structure config
const classConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'interviewConfig.json'), 'utf-8'));
// Load instance values config
const instanceConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'interviewInstance.json'), 'utf-8'));

// Dynamically create interview "class" as a function (or you could use a Proxy/class if you want)
function createInterview(config, values) {
    const obj = {};
    // Set properties from propertyKeys
    config.propertyKeys.forEach(key => {
        obj[key] = values[key];
    });
    // Add previousQuestions if present
    obj.previousQuestions = values.previousQuestions || [];
    // Add promptTemplate
    obj.promptTemplate = config.promptTemplate;
    // Add buildPrompt method
    obj.buildPrompt = function() {
        let prompt = this.promptTemplate;
        config.propertyKeys.forEach(key => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            prompt = prompt.replace(regex, this[key] ?? '');
        });
        // Handle previousQuestions
        if (this.previousQuestions && this.previousQuestions.length) {
            prompt = prompt.replace('{{previousQuestions}}',
                this.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
            );
        }
        return prompt;
    };
    return obj;
}

// Create interview object from config and values
const interview = createInterview(classConfig, instanceConfig);

// Build prompt
const prompt = interview.buildPrompt();

// --- AI Call and Output ---
const ai = new GoogleGenAI({ apiKey: "AIzaSyAw5WzAFbDtEZJ__hsw3wLdsbkHko6wvRg" });

async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
    });

    // Try to parse JSON array from response
    try {
        const match = response.text.match(/```json\s*([\s\S]*?)```/i) || response.text.match(/```([\s\S]*?)```/);
        const jsonString = match ? match[1] : response.text;
        const questions = JSON.parse(jsonString);
        console.log("Interview Questions:", questions);
    } catch (e) {
        console.error("Failed to parse JSON:", response.text);
    }
}

main();