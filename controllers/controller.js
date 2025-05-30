import { addUser, verifyUser, addSymbol, fetchWatchlist, deleteSymbol } from '../db/queries.js';
import { getStockPrice } from '../utils/api.js';
import { generateStockAnalysis } from '../utils/llm_api.js';

// Login page
export function getLoginPage(req, res) {
    if (req.session.user) {
        return res.redirect('/watchlist');
    }
    res.render('login', { message: null });
}

// Handle login
export async function handleLogin(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
             return res.render('login', { message: 'Email is required.' });
        }
        let userId = await verifyUser(email);
        if (!userId) {
            userId = await addUser(email);
             if (!userId) {
                throw new Error("Failed to create or find user.");
            }
        }
        req.session.user = { id: userId, email: email };
        res.redirect('/watchlist');
    } catch (error) {
        console.error("Login Error:", error);
        res.render('login', { message: `Login failed: ${error.message}` });
    }
}

// Logout
export function handleLogout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/login');
    });
}

// Protected watchlist page
export async function getWatchlist(req, res) {
    try {
        const watchlistData = await fetchWatchlist(req.session.user.id);
        res.render('watchlist', {
            watchlist: watchlistData,
            user: req.session.user,
            message: req.query.message || null
        });
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        res.render('watchlist', {
            message: `Error fetching watchlist: ${error.message}`,
            watchlist: [],
            user: req.session.user
        });
    }
}

// Protected add symbol route
export async function addToWatchlist(req, res) {
    let message = '';
    let messageType = 'error';
    try {
        const { symbol } = req.body;
        if (!symbol) throw new Error("Stock symbol is required.");

        const upperSymbol = symbol.toUpperCase().trim();

        await getStockPrice(upperSymbol);

        const added = await addSymbol(req.session.user.id, upperSymbol);
        message = added ? `Added ${upperSymbol} to watchlist.` : `${upperSymbol} is already in your watchlist.`;
        messageType = added ? 'success' : 'info';

    } catch (error) {
        console.error("Error adding symbol:", error);
        message = error.message;
    }
    res.redirect(`/watchlist?message=${encodeURIComponent(message)}&type=${messageType}`);
}

// Delete Symbol
export async function deleteFromWatchlist(req, res) {
     let message = '';
     let messageType = 'error';
    try {
        const { symbol } = req.body;
         if (!symbol) throw new Error("Symbol is required for deletion.");

        const deleted = await deleteSymbol(req.session.user.id, symbol);
        message = deleted ? `Successfully deleted ${symbol}` : `Could not find ${symbol} in watchlist.`;
        messageType = deleted ? 'success' : 'error';

    } catch (error) {
        console.error("Error deleting symbol:", error);
        message = `Error deleting symbol: ${error.message}`;
    }
     res.redirect(`/watchlist?message=${encodeURIComponent(message)}&type=${messageType}`);
}

// API endpoint for getting stock data (used by frontend JS)
export async function getStockData(req, res) {
    try {
        const { symbol } = req.query;
        if (!symbol) return res.status(400).json({ error: 'Symbol query parameter is required' });

        const upperSymbol = symbol.toUpperCase().trim();

        if (!process.env.API_KEY) {
            console.error('API key is not set. Ensure you have required dotenv.config() in your main application file.');
            return res.status(500).json({ error: 'API key is missing. Cannot proceed with the request.' });
        }

        req.session.stockCache = req.session.stockCache || {};

        const cachedData = req.session.stockCache[upperSymbol];
        const now = Date.now();
        if (cachedData && (now - cachedData.timestamp) < 300000) {
            return res.json(cachedData.data);
        }

        const stockData = await getStockPrice(upperSymbol);

        try {
            console.log(`Attempting LLM analysis for ${upperSymbol}...`);
            stockData.analysis = await generateStockAnalysis({
                ...stockData,
                symbol: upperSymbol
            });
            console.log(`Analysis received for ${upperSymbol}:`, stockData.analysis);
        } catch (llmError) {
            console.warn(`LLM analysis failed for ${upperSymbol}:`, llmError.message);
            console.error('Full LLM error:', llmError);
            stockData.analysis = "Could not generate analysis at this time.";
        }

        req.session.stockCache[upperSymbol] = {
            data: stockData,
            timestamp: now
        };

        res.json(stockData);

    } catch (error) {
        console.error(`Error in getStockData for ${req.query.symbol}:`, error);
        res.status(error.message.includes('not found') ? 404 : 500)
           .json({
               error: error.message,
               symbol: req.query.symbol
           });
    }
}

