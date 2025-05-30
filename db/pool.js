import 'dotenv/config';
import pg from 'pg'; // Import default export from 'pg'

const { Pool } = pg; // Destructure Pool from the default export

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Use environment variable
    // Add other pool configurations if needed (e.g., ssl)
    // ssl: {
    //   rejectUnauthorized: false // Example for Heroku/Render
    // }
});

// Export the pool instance as default or named
export default pool;