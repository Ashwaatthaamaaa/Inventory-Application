// Load environment variables using ESM syntax
import 'dotenv/config'; // Note: Installs 'dotenv' if not already

// Import the function using ESM syntax
// Make sure the path and .js extension are correct
import { generateStockAnalysis } from './utils/llm_api.js';

// Basic test function (can remain mostly the same)
async function runTest() {
    console.log("Running llm_api test (ESM)...");

    if (!process.env.GOOGLE_API_KEY) {
        console.error("ERROR: GOOGLE_API_KEY environment variable not found.");
        console.error("Make sure you have a .env file with GOOGLE_API_KEY set.");
        return;
    } else {
        console.log("Google API Key found.");
    }

    const mockStockData = {
        symbol: 'AAPL',
        price: 180.00,
        change: 1.50,
        volume: '20M'
    };

    try {
        console.log("Calling generateStockAnalysis with mock data...");
        const analysis = await generateStockAnalysis(mockStockData);

        if (analysis && typeof analysis === 'string' && analysis.length > 0) {
            console.log("SUCCESS: Received analysis:");
            console.log("--------------------------");
            console.log(analysis);
            console.log("--------------------------");
        } else {
            console.error("ERROR: Did not receive a valid analysis string.");
        }
    } catch (error) {
        console.error("ERROR during generateStockAnalysis call:");
        console.error(error);
    }
}

// Run the test
runTest(); 