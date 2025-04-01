require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const router = require('./routes/router');

const app = express();

// Session middleware configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Add middleware to make session available in templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Routes
app.use('/', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});