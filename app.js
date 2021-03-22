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
app.get('/products', (req, res) => {
  let page = 1;
  let count = 5;
  // update page and count values if client sent params for page or count
  if (req.body.page) {
    page = parseInt(req.body.page);
  };
  if (req.body.count) {
    count = parseInt(req.body.count);
  };

  // select count number of products starting at page number intervals of count
  const queryText = `SELECT * FROM products LIMIT ${count} OFFSET ${(page * count) - count}`;
  client.query(queryText)
    .then(dbRes => res.send(dbRes.rows))
    .catch(e => console.error(e))
});

// Returns all product level information for a specified product id.
app.get('/products/:product_id', (req, res) => {
  const id = [req.params.product_id];
  const queryText = `SELECT p.product_id, p.product_name, p.slogan, p.product_description, p.category, p.default_price,
   json_object_agg(f.feature_name, f.feature_value) as features
    FROM products p, features f
    WHERE p.product_id=$1 AND f.product_id=$1
    GROUP BY p.product_id;`;

  client.query(queryText, id)
    // parse query response to match desired format
    .then((dbRes) => {
      let product = dbRes.rows[0];
      let keys = Object.keys(product.features);
      // convert features into an array of objects
      product.features = keys.map((feature) => {
        return {
          'feature': feature,
          'value': product.features[feature]
        }
      });
      res.send(product);
    })
    .catch(e => console.error(e))
});

// Returns the all styles available for the given product.
app.get('/products/:product_id/styles', (req, res) => {
  res.send(req.params.product_id)
});

// Returns the id's of products related to the product specified.
app.get('/products/:product_id/related', (req, res) => {
  const id = [req.params.product_id];
  const queryText = `SELECT array_agg(related_product_id) as related FROM related_products WHERE current_product_id = $1;`;

  client.query(queryText, id)
    .then((dbRes) => res.send(dbRes.rows[0].related))
    .catch(e => console.error(e))

});


app.listen(port, () => {
  client.connect();
  console.log(`Atelier Products listening at http://localhost:${port}`)
})
