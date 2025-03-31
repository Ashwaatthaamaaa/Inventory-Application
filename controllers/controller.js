const { addUserAndSymbol } = require('../db/queries');
const { getStockPrice } = require('../utils/api');

// Render the main page
function getList(req, res) {
    res.render('index', { message: null });
}

// Handle form submission
// controllers/controller.js (Improved Error Handling)
async function addToWatch(req, res) {
    try {
        const { email, symbol } = req.body;
        if(!email || !symbol){
            throw new Error("Email and symbol must be provided");
        }
        const stockData = await getStockPrice(symbol);
        if(!stockData.data[symbol]){
            throw new Error("Stock symbol not found");
        }
        await addUserAndSymbol(email, symbol);
        res.render('index', { 
            message: `Successfully added ${symbol} to watchlist for ${email}` 
        });
    } catch (error) {
        let message = `Error: ${error.message}`;
        if(error.message === "DUPLICATE_SYMBOL"){
            message = "Error: This stock symbol is already in your watchlist";
        }
        res.render('index', { 
            message: message
        });
    }
}00

module.exports = {
    getList,
    addToWatch
};