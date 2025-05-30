import pool from './pool.js';

export async function addUser(email) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const userRes = await client.query(`
            INSERT INTO users (email)
            VALUES ($1)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        `, [email]);

        await client.query('COMMIT');
        if (userRes.rowCount === 0) {
            const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
            return existingUser.rows[0]?.id || null;
        }
        return userRes.rows[0]?.id || null;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding user:', err);
        throw err;
    } finally {
        client.release();
    }
}

export async function verifyUser(email) {
    const client = await pool.connect();
    try {
        const result = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0]?.id || null;
    } catch (err) {
        console.error('Error verifying user:', err);
        throw err;
    } finally {
        client.release();
    }
}

export async function addSymbol(userId, symbol) {
    if (!userId) throw new Error('User must be logged in');
    
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const watchlistRes = await client.query(`
            INSERT INTO watchlist (user_id, stock_symbol)
            VALUES ($1, $2)
            ON CONFLICT (user_id, stock_symbol) 
            DO NOTHING
            RETURNING id
        `, [userId, symbol]);

        await client.query('COMMIT');
        return watchlistRes.rowCount > 0;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding symbol:', err);
        throw err;
    } finally {
        client.release();
    }
}

export async function fetchWatchlist(userId) {
    if (!userId) throw new Error('User must be logged in');

    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT stock_symbol FROM watchlist WHERE user_id = $1
            ORDER BY stock_symbol DESC
        `, [userId]);
        return result.rows;
    } catch (err) {
        console.error('Error fetching watchlist:', err);
        throw err;
    } finally {
        client.release();
    }
}

export async function deleteSymbol(userId, symbol) {
    if (!userId || !symbol) throw new Error('User ID and symbol required');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const deletedSymbols = await client.query(
            'DELETE FROM watchlist WHERE user_id=$1 AND stock_symbol=$2 RETURNING id',
            [userId, symbol]
        );
        if (deletedSymbols.rowCount === 0) {
            return false;
        }
        await client.query('COMMIT');
        return true;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error deleting symbol:', err);
        throw err;
    } finally {
        client.release();
    }
}