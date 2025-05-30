import 'dotenv/config';
console.log('Checking environment variables:');
console.log('API_KEY (from code check):', process.env.api_key ? 'Found (value: ' + process.env.api_key + ')' : 'Not found');
console.log('Full process.env dump for debugging:', JSON.stringify(process.env, null, 2));

import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/router.js';

// Equivalent for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Add middleware to make session user available in templates
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Routes
app.use('/', router);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});