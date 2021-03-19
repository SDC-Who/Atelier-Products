const express = require('express');
const client = require('./database');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the Atelier Products API');
});

// Retrieves the list of products.
// GET /products
app.get('/products', (req, res) => {
  client.query('SELECT * FROM products')
  .then(dbRes => res.send(dbRes.rows))
  .catch(e => console.error(e))
});

// Returns all product level information for a specified product id.
// GET /products/:product_id
app.get('/products/:product_id', (req, res) => {
  res.send(req.params.product_id)
});

// Returns the all styles available for the given product.
// GET /products/:product_id/styles
app.get('/products/:product_id/styles', (req, res) => {
  res.send(req.params.product_id)
});

// Returns the id's of products related to the product specified.
// GET /products/:product_id/related
app.get('/products/:product_id/related', (req, res) => {
  res.send(req.params.product_id)
});


app.listen(port, () => {
  client.connect();
  console.log(`Atelier Products listening at http://localhost:${port}`)
})
