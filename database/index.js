const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'postgres',
  host: '3.91.214.69',
  port: 5432,
  database: 'products',
});

module.exports = client;
