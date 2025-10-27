// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'masato',
    password: process.env.DB_PASSWORD || 'qwerty123',
    port: process.env.DB_PORT || 5432,
});

module.exports = pool;