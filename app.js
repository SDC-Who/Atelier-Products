const express = require('express');
const bodyParser = require('body-parser');
const client = require('./database');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the Atelier Products API');
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


// Retrieves the list of products.
// GET /products
app.get('/products', (req, res) => {
  let page = 1;
  let count = 5;
  // update page and count values if client sent params for page or count
  if(req.body.page) {
    page = parseInt(req.body.page);
  };
  if(req.body.count) {
    count = parseInt(req.body.count);
  };

  // SELECT * FROM reviews WHERE product_id = ${product_id} LIMIT ${response.count} OFFSET ${response.page * response.count}

  const queryText = `SELECT * FROM products LIMIT ${count} OFFSET ${(page * count) - count}`;
  client.query(queryText)
  .then(dbRes => res.send(dbRes.rows))
  .catch(e => console.error(e))
});

// Returns all product level information for a specified product id.
// GET /products/:product_id
app.get('/products/:product_id', (req, res) => {
  console.log(req.body)
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
