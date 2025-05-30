#! /usr/bin/env node
import 'dotenv/config'; // If using env vars here
import pool from './pool.js';

async function clearTables() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Use CASCADE to handle foreign keys or truncate in specific order
        await client.query('TRUNCATE TABLE watchlist, users RESTART IDENTITY CASCADE');
        await client.query('COMMIT');
        console.log('Tables truncated successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error clearing tables:', err);
        throw err;
    } finally {
        client.release();
        pool.end(); // Close pool after script finishes
    }
}

clearTables()
    .catch(err => {
        console.error("Clear script failed:", err);
        process.exit(1);
    });
