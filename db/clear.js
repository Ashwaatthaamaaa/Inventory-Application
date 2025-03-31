#! /usr/bin/env node
const pool = require('./pool');

async function clearTables() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Either use CASCADE
        await client.query('TRUNCATE TABLE users, watchlist CASCADE');
        
        // OR truncate in correct order (watchlist first, then users)
        // await client.query('TRUNCATE TABLE watchlist');
        // await client.query('TRUNCATE TABLE users');
        
        await client.query('COMMIT');
        console.log('Tables cleared successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error clearing tables:', err);
        throw err;
    } finally {
        client.release();
    }
}

clearTables()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
