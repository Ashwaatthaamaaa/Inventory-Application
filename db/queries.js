const pool = require('./pool');

async function addUser(email) {
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
        return userRes.rows[0]?.id || null;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding user:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function verifyUser(email) {
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

async function addSymbol(userId, symbol) {
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

        if (watchlistRes.rowCount === 0) {
            throw new Error('DUPLICATE_SYMBOL');
        }

        await client.query('COMMIT');
        return true;

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding symbol:', err);
        throw err;
    } finally {
        client.release();
    }
}

async function fetchWatchlist(userId) {
    if (!userId) throw new Error('User must be logged in');

    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT stock_symbol 
            FROM watchlist 
            WHERE user_id = $1
        `, [userId]);
        return result.rows;
    } catch (err) {
        console.error('Error fetching watchlist:', err);
        throw err;
    } finally {
        client.release();
    }
}

module.exports = {
    addUser,
    verifyUser,
    addSymbol,
    fetchWatchlist
};