const { addUser, verifyUser, addSymbol, fetchWatchlist,deleteSymbol } = require('../db/queries');
const { getStockPrice } = require('../utils/api');

// Login page
function getLoginPage(req, res) {
    if (req.session.user) {
        return res.redirect('/watchlist');
    }
    res.render('login', { message: null });
}

// Handle login
async function handleLogin(req, res) {
    try {
        const { email } = req.body;
        let userId = await verifyUser(email);
        
        if (!userId) {
            userId = await addUser(email);
        }
        
        // Set session data
        req.session.user = {
            id: userId,
            email: email
        };
        
        res.redirect('/watchlist');
    } catch (error) {
        res.render('login', { 
            message: `Error: ${error.message}` 
        });
    }
}

// Logout
function handleLogout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
}

// Protected watchlist page
async function getWatchlist(req, res) {
    try {
        const watchlist = await fetchWatchlist(req.session.user.id);
        res.render('watchlist', { 
            watchlist,
            user: req.session.user,
            message: null 
        });
    } catch (error) {
        res.render('watchlist', { 
            message: `Error: ${error.message}`,
            watchlist: [],
            user: req.session.user
        });
    }
}

// Protected add symbol route
async function addToWatchlist(req, res) {
    try {
        const { symbol } = req.body;
        
        // Verify stock exists
        const stockData = await getStockPrice(symbol);
        
        if (stockData) {
            await addSymbol(req.session.user.id, symbol);
            
            const watchlist = await fetchWatchlist(req.session.user.id);
            res.render('watchlist', { 
                message: `Added ${symbol} to watchlist`,
                watchlist,
                user: req.session.user
            });
        } else {
            res.render('watchlist', { 
                message: `Error: Stock symbol ${symbol} not found`,
                watchlist: [],
                user: req.session.user
            });
        }
    } catch (error) {
        res.render('watchlist', { 
            message: `Error: ${error.message}`,
            watchlist: [],
            user: req.session.user
        });
    }
}

// Add a new route handler for getting stock data
async function getStockData(req, res) {
    try {
        const { symbol } = req.query;
        
        // Initialize stockCache in session if it doesn't exist
        if (!req.session.stockCache) {
            req.session.stockCache = {};
        }

        // Check if we have cached data and it's less than 5 minutes old
        const cachedData = req.session.stockCache[symbol];
        const now = Date.now();
        if (cachedData && (now - cachedData.timestamp) < 300000) { // 5 minutes
            return res.json(cachedData.data);
        }

        // If no cache or expired, fetch new data
        const stockData = await getStockPrice(symbol);
        
        // Cache the new data with timestamp
        req.session.stockCache[symbol] = {
            data: stockData,
            timestamp: now
        };

        res.json(stockData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteFromWatchlist(req,res) {

    try{
        const {symbol} = req.body;

        await deleteSymbol(req.session.user.id,symbol);

        const watchlist = await fetchWatchlist(req.session.user.id);

        res.render('watchlist',{
            message: `Successfully deleted ${symbol} from watchlist`,
            watchlist,
            user:req.session.user
            }
        )
    }catch(err){
        const watchlist = await fetchWatchlist(req.session.user.id);

        res.render('watchlist',{
            message: `Error: ${error.message}`,
            watchlist,
            user:req.session.user
            }
        )
    }
    
}

module.exports = {
    getLoginPage,
    handleLogin,
    handleLogout,
    getWatchlist,
    addToWatchlist,
    deleteFromWatchlist,
    getStockData
};