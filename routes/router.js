import express from 'express';
// Import controller functions individually
import {
    getLoginPage,
    handleLogin,
    handleLogout,
    getWatchlist,
    addToWatchlist,
    deleteFromWatchlist,
    getStockData // Import the new API handler
} from '../controllers/controller.js';
import { requireLogin } from '../middleware/auth.js';
import { generateStockAnalysis } from '../utils/llm_api.js';

const router = express.Router();

// Public routes
router.get('/', getLoginPage); // Redirect root to login
router.get('/login', getLoginPage);
router.post('/login', handleLogin);
router.get('/logout', handleLogout);

// Protected routes (apply middleware)
router.get('/watchlist', requireLogin, getWatchlist);
router.post('/add-symbol', requireLogin, addToWatchlist);
router.post('/delete-symbol', requireLogin, deleteFromWatchlist);

// API route for frontend JS (also protected)
router.get('/api/stock-data', requireLogin, getStockData);

// Test route for LLM API with expanded error details
router.get('/test-llm', async (req, res) => {
    try {
        // Log environment variable value (safely)
        console.log('Testing LLM with API key status:', process.env.GOOGLE_API_KEY ? 'Set' : 'Not set');
        
        const result = await generateStockAnalysis({
            symbol: 'AAPL',
            name: 'Apple Inc.',
            price: 178.72,
            change: 2.50,
            percentChange: 1.40,
            volume: '14.6M'
        });
        res.json({ success: true, result });
    } catch (error) {
        console.error('LLM Test Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
            apiKeySet: !!process.env.GOOGLE_API_KEY
        });
    }
});

export default router; // Use default export for the router

