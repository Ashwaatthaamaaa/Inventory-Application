const express = require('express');
const controller = require('../controllers/controller');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.get('/',controller.getLoginPage)
router.get('/login', controller.getLoginPage);
router.post('/login', controller.handleLogin);
router.get('/logout', controller.handleLogout);

// Protected routes
router.get('/watchlist', requireLogin, controller.getWatchlist);
router.post('/add-symbol', requireLogin, controller.addToWatchlist);
router.post('/delete-symbol', requireLogin, controller.deleteFromWatchlist);

module.exports = router;

