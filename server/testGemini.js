import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
    console.log('Testing Gemini API Key...');
    console.log('API Key (first 10 chars):', process.env.GEMINI_API_KEY?.substring(0, 10));
    
    const models = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro', 'models/gemini-pro'];
    
    for (const modelName of models) {
        try {
            console.log(`\nTrying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say hello!");
            const response = await result.response;
            const text = response.text();
            console.log(`✅ SUCCESS with ${modelName}:`);
            console.log(`Response: ${text.substring(0, 100)}...`);
            break;
        } catch (error) {
            console.log(`❌ FAILED with ${modelName}: ${error.message}`);
        }
    }
}

testGemini();
