const axios = require('axios');

const baseURL = process.env.baseURL;
const key = process.env.api_key;

if(!baseURL || !key){
    throw new Error("API configuration is missing.");
}

const apiClient = axios.create({
    baseURL: baseURL,
    params: {
        'access_key': key
    }
});

function formatVolume(volume) {
    if (!volume) return 'N/A';
    if (volume >= 1e9) return (volume / 1e9).toFixed(1) + "B";
    if (volume >= 1e6) return (volume / 1e6).toFixed(1) + "M";
    return volume.toString();
}

function generateStockSummary(dataArray) {
    if (!dataArray || dataArray.length < 2) return null;

    const latest = dataArray[0];
    const previous = dataArray[1];

    const price = latest.close;
    const change = +(price - previous.close).toFixed(2);
    const percentChange = +((change / previous.close) * 100).toFixed(2);
    const volume = formatVolume(latest.volume);

    return {
        name: latest.name || "Unknown",
        price: +price.toFixed(2),
        change,
        percentChange,
        volume,
        dividend: latest.dividend || 0
    };
}

async function getStockPrice(symbol) {
    if (!symbol) throw new Error('Symbol cannot be empty');

    try {
        const response = await apiClient.get('', {
            params: {
                symbols: symbol
            }
        });

        // Handle various error cases
        if (response.data.error) {
            // API returns error object for invalid symbols
            throw new Error(`Stock symbol '${symbol}' not found`);
        }

        if (!response.data || !response.data.data) {
            throw new Error(`No data available for ${symbol}`);
        }

        if (response.data.data.length < 2) {
            throw new Error(`Insufficient historical data for ${symbol}`);
        }

        const stockData = generateStockSummary(response.data.data);
        if (!stockData) {
            throw new Error(`Failed to process data for ${symbol}`);
        }

        return stockData;

    } catch(err) {
        // First check if it's an API error response
        if (err.response && err.response.data) {
            if (err.response.data.error) {
                // MarketStack specific error handling
                throw new Error(`Stock symbol '${symbol}' not found`);
            }
            if (err.response.status === 429) {
                throw new Error('API rate limit exceeded. Please try again later.');
            }
            if (err.response.status === 401) {
                throw new Error('API authentication failed. Please check your API key.');
            }
        }
        
        // If it's our custom error, throw it directly
        if (err.message.includes("not found") || 
            err.message.includes("No data available") ||
            err.message.includes("Insufficient historical") ||
            err.message.includes("Failed to process")) {
            throw err;
        }

        // For network errors
        if (err.request) {
            throw new Error('Unable to reach stock data service. Please try again later.');
        }

        // For any other errors
        console.error('Error fetching stock data:', err);
        throw new Error('Failed to fetch stock data. Please try again later.');
    }
}

module.exports = { getStockPrice };

// Remove the test call as it can cause issues
// getStockPrice('ZOMATO');

