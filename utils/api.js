const axios = require('axios');

const baseURL = process.env.baseURL;
const key = process.env.api_key;

if(!baseURL || !key){
    console.error('API not configured - missing baseURL or API key');
    throw new Error("API configuration is missing.");
}

const apiClient = axios.create({
    baseURL: baseURL,
    params: {
        'access_key': key
    }
});

async function getStockPrice(symbol) {
    if (!symbol) throw new Error('Symbol cannot be empty');

    try {
        const response = await apiClient.get('', {
            params: {
                symbols: symbol
            }
        });
        return response.data;
    } catch(err) {
        console.error('error fetching', err);
        throw err;
    }
}

getStockPrice('NVDA')

module.exports = { getStockPrice };

