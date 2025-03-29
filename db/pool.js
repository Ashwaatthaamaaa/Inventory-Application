const {Pool} = require('pg');

module.exports = new Pool({
    connectionString:"postgresql://lunge:291152@localhost:5432/inventory_db"
});