// utils/api.js
     import 'dotenv/config';
     import axios from 'axios';
     const API_KEY      = process.env.API_KEY;
     const API_BASE_URL = process.env.API_BASE_URL;
     if (!API_KEY||!API_BASE_URL) throw new Error('Missing API config');
     const apiClient = axios.create({
       baseURL: API_BASE_URL,
       params: { access_key: API_KEY }
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
        name: latest.name || "Unknown", // Ensure name exists
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
        const response = await apiClient.get('/eod', {
            params: {
                symbols: symbol,
                date_from: new Date(Date.now() - 7*24*60*60*1000).toISOString().slice(0,10),  // From previous updates
                date_to: new Date().toISOString().slice(0,10)
            }
        });
        
        console.log('Raw API Response:', JSON.stringify(response.data, null, 2));  // Added logging for the raw response
        
        if (response.data.error) {
            console.error(`API Error for ${symbol}:`, response.data.error);
            throw new Error(`Stock symbol '${symbol}' not found (API Error: ${response.data.error.code})`);
        }
        
        if (!response.data || !response.data.data) {
            console.error(`No data available for ${symbol}:`, response.data);
            throw new Error(`No data available for ${symbol}`);
        }
        
        if (response.data.data.length < 2) {
            console.error(`Insufficient historical data for ${symbol}:`, response.data.data);
            throw new Error(`Insufficient historical data for ${symbol}`);
        }
        
        const stockData = generateStockSummary(response.data.data);
        if (!stockData) {
            console.error(`Failed to process data for ${symbol}`);
            throw new Error(`Failed to process data for ${symbol}`);
        }
        
        return stockData;
    } catch (err) {
        if (err.response) {
            if (err.response.status === 401 || err.response.status === 422) {
                console.error(`API Error (${err.response.status}) for ${symbol}: Possibly invalid parameters or API key. Check .env file.`, err.response.data);
            }
            console.error(`API Error (${err.response.status}) for ${symbol}:`, err.response.data);
            throw new Error(`Failed to fetch data for ${symbol}. API responded with status ${err.response.status}.`);
        } else if (err.request) {
            console.error('Unable to reach stock data service. Check your network or API endpoint.');
            throw new Error('Unable to reach stock data service.');
        }
        console.error('Error in getStockPrice:', err);
        throw err;
    }
}

export { getStockPrice };