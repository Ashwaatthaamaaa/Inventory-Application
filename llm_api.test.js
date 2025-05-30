// Load environment variables specifically for this test
require('dotenv').config();

// Try this temporarily for debugging
const path = require('path');
const llmApiPath = path.resolve(__dirname, 'utils', 'llm_api.mjs');
console.log("Attempting to require:", llmApiPath); // Log the path Node is trying
const { generateStockAnalysis } = require(llmApiPath);

// Basic test function
async function runTest() {
    console.log("Running llm_api test...");

    // Check if API key is loaded
    if (!process.env.GOOGLE_API_KEY) {
        console.error("ERROR: GOOGLE_API_KEY environment variable not found.");
        console.error("Make sure you have a .env file with GOOGLE_API_KEY set.");
        return;
    } else {
        console.log("Google API Key found.");
    }

    // Mock stock data
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
        console.error(error); // Log the specific error from the API call
    }
}

// Run the test
runTest(); 