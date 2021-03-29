const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: '3.91.214.69',
  port: 5432,
  database: 'products',
});

module.exports = pool;
