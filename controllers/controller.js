const { addUserAndSymbol } = require('../db/queries');
const { getStockPrice } = require('../utils/api');

// Render the main page
function getList(req, res) {
    res.render('index', { message: null });
}

// Handle form submission
async function addToWatch(req, res) {
    try {
        const { email, symbol } = req.body;
        
        // First verify the stock exists via API
        const stockData = await getStockPrice(symbol);
        
        // If stock exists, add to database using the combined function
        if (stockData) {
            await addUserAndSymbol(email, symbol);
            res.render('index', { 
                message: `Successfully added ${symbol} to watchlist for ${email}` 
            });
        } else {
            res.render('index', { 
                message: `Error: Stock symbol ${symbol} not found` 
            });
        }
    } catch (error) {
        res.render('index', { 
            message: `Error: ${error.message}` 
        });
    }
}

module.exports = {
    getList,
    addToWatch
};