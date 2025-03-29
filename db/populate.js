#! /usr/bin/env node
const Pool = require('./pool');


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

async function main(params) {
    console.log(Pool);
    const client = await Pool.connect();
    try {
        await client.query(SQL);
    } catch (error) {
        console.error('Error executing query', error.stack);
    } finally {
        client.release();
    }
}

main();