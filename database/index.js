const { Client } = require('pg')
const client = new Client({
  user: 'aubreybachant',
  database: 'myTEST',
})

client.connect()
  .then(() => console.log('successful connection'))
  .catch((e) => console.error(e))
  .finally(() => client.end())