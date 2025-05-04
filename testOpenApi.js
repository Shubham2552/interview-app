const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: "AIzaSyAw5WzAFbDtEZJ__hsw3wLdsbkHko6wvRg" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Give me a single react question to ask a user",
  });
  console.log(response.text);
}

main();