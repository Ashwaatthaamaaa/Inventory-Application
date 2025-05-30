#! /usr/bin/env node
import 'dotenv/config';
import pool from './pool.js';

const SQL = `

CREATE TABLE IF NOT EXISTS users  (
    id SERIAL PRIMARY KEY,
    sso_id VARCHAR(255),        -- Unique ID from the SSO provider
    sso_provider VARCHAR(50),    -- Name of the SSO provider (e.g., 'google', 'facebook')
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (sso_id, sso_provider) -- Ensure unique ID per provider
);

-- Index for faster lookups by SSO ID and provider
CREATE INDEX IF NOT EXISTS idx_users_sso ON users (sso_id, sso_provider);


CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_symbol VARCHAR(10) NOT NULL,
    UNIQUE (user_id, stock_symbol)
);

-- Index for efficient querying of a user's watchlist
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist (user_id);
`;

async function createTables() {
    const client = await pool.connect();
    try {
        await client.query(`
            DROP TABLE IF EXISTS watchlist; 
            DROP TABLE IF EXISTS users;
            
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS watchlist (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                stock_symbol VARCHAR(10) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, stock_symbol)
            );
        `);
        console.log('Tables dropped (if existed) and created successfully');
    } catch (err) {
        console.error('Error creating tables:', err);
    } finally {
        client.release();
        pool.end(); // Close pool after script finishes
    }
}

createTables();