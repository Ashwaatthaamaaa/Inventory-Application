const pool = require('./pool');




async function addUserAndSymbol(email, symbol) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get/Create User
        const userRes = await client.query(`
            INSERT INTO users (email)
            VALUES ($1)
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        `, [email]);

        // Handle existing user
        let userId;
        if (userRes.rows.length === 0) {
            // User already exists - get their ID
            const existingUser = await client.query(
                'SELECT id FROM users WHERE email = $1', 
                [email]
            );
            userId = existingUser.rows[0].id;
        } else {
            userId = userRes.rows[0].id;
        }

        // 2. Insert into Watchlist with Duplicate Check
        const watchlistRes = await client.query(`
            INSERT INTO watchlist (user_id, stock_symbol)
            VALUES ($1, $2)
            ON CONFLICT (user_id, stock_symbol) 
            DO NOTHING
            RETURNING id
        `, [userId, symbol]);

        if (watchlistRes.rowCount === 0) {
            throw new Error('DUPLICATE_SYMBOL'); // Custom error code
        }

        await client.query('COMMIT');
        return { success: true, userId };

    } catch (err) {
        await client.query('ROLLBACK');
        
        // Handle specific error cases
        if (err.code === '23505') { // PostgreSQL unique violation
            if (err.constraint === 'users_email_key') {
                throw new Error('DUPLICATE_EMAIL');
            }
            if (err.constraint === 'watchlist_user_id_stock_symbol_key') {
                throw new Error('DUPLICATE_SYMBOL');
            }
        }
        
        console.error('Transaction error:', err);
        throw err; // Re-throw other errors
    } finally {
        client.release();
    }
}



module.exports = {
    addUserAndSymbol
}
;