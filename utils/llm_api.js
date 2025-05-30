import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

// Get API key from environment variables
const GEMINI_API_KEY = process.env.gemini_api_key;
console.log('GEMINI API Key status:', GEMINI_API_KEY ? 'Found' : 'Not found');

// Initialize the client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateStockAnalysis(stockData) {
    if (!stockData || !stockData.symbol) {
        throw new Error("Invalid stock data provided for analysis.");
    }
    
    if (!GEMINI_API_KEY) {
        throw new Error("Gemini API Key is missing. Check .env configuration.");
    }
    
    try {
        console.log(`Starting analysis for ${stockData.symbol}...`);
        
        const prompt = `Analyze this stock data and provide a brief summary (1-2 sentences):
            Symbol: ${stockData.symbol}
            Name: ${stockData.name}
            Price: $${stockData.price?.toFixed(2)}
            Change: ${stockData.change?.toFixed(2)}
            % Change: ${stockData.percentChange?.toFixed(2)}%
            Volume: ${stockData.volume}
            Focus on recent performance and outlook.`;
        
        console.log('Calling Gemini API...');
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",  // Using a current model
            contents: prompt,
        });
        
        console.log('API call completed');
        const text = response.text;
        console.log('Generated analysis:', text);
        
        return text.trim();
    } catch (error) {
        console.error(`Error generating analysis for ${stockData.symbol}:`, error);
        throw new Error(`Failed to generate analysis: ${error.message}`);
    }
} 