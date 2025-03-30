const { addUser ,addSymbol} = require('../db/queries');
const { getStockPrice } = require('../utils/api');  // Update this line
// ... rest of the controller code
// Render the main page
function getList(req, res) {
    res.render('index', { message: null });
}

// Handle form submission
async function addToWatch(req, res) {
    try {
        const { email, symbol } = req.body;
        
        // First, add user to database
        await addUser(email);
        
        // Then check if stock exists via API
        const stockData = await getStockPrice(symbol);
        
        if(stockData){
            await addSymbol(email,symbol);
        }
        res.render('index', { 
            message: `Successfully added ${symbol} to watchlist for ${email}` 
        });
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