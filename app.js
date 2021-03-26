/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */

const express = require('express');
const bodyParser = require('body-parser');
const client = require('./database');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Welcome to the Atelier Products API');
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

client.connect()
  .then(() => console.log('connected'))
  .catch(err => console.log('connection error', err.stack))

// Retrieves the list of products.
app.get('/products', (req, res) => {
  console.log('looking that up')
  let page = 1;
  let count = 5;
  // update page and count values if client sent params for page or count
  if (req.body.page) {
    page = parseInt(req.body.page, 10);
  }
  if (req.body.count) {
    count = parseInt(req.body.count, 10);
  }

  // select count number of products starting at page number intervals of count
  const queryText = `SELECT * FROM products LIMIT ${count} OFFSET ${(page * count) - count}`;
  client.query(queryText)
    .then((dbRes) => res.send(dbRes.rows))
    .catch((e) => console.error(e));
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
      const product = dbRes.rows[0];
      const keys = Object.keys(product.features);
      // convert features into an array of objects
      product.features = keys.map((key) => (
        {
          feature: key,
          value: product.features[key],
        }
      ));
      res.send(product);
    })
    .catch((e) => console.error(e));
});

/// Returns the all styles available for the given product.
app.get('/products/:product_id/styles', (req, res) => {
  let id = [req.params.product_id];
  let queryText = `SELECT s.style_id, s.style_name, s.original_price, s.sale_price, s.default_style
  FROM styles s WHERE s.product_id = $1;`;
  let results;

  // for each style query for their photos
  async function getPhotos() {
    queryText = 'SELECT photo_url, thumbnail_url FROM photos WHERE style_id = $1;';
    for (let i = 0; i < results.length; i += 1) {
      // use style id to search for matching photos and skus
      id = [results[i].style_id];
      await client.query(queryText, id)
        // add photos and skus to style in
        .then((dbRes) => {
          results[i].photos = dbRes.rows;
        })
        .catch((e) => console.error(e));
    }
  }

  // for each style query for their skus
  async function getSkus() {
    queryText = 'SELECT size, quantity FROM skus WHERE style_id = $1;';
    for (let i = 0; i < results.length; i += 1) {
      // use style id to search for matching photos and skus
      id = [results[i].style_id];
      await client.query(queryText, id)
        // add photos and skus to style in
        .then((dbRes) => {
          results[i].skus = dbRes.rows;
        })
        .catch((e) => console.error(e));
    }
  }

  client.query(queryText, id)
    .then((dbRes) => { results = dbRes.rows; })
    .then(() => getPhotos())
    .then(() => getSkus())
    .then(() => res.send(results))
    .catch((e) => console.error(e));
});

// Returns the id's of products related to the product specified.
app.get('/products/:product_id/related', (req, res) => {
  const id = [req.params.product_id];
  const queryText = 'SELECT array_agg(related_product_id) as related FROM related_products WHERE current_product_id = $1;';

  client.query(queryText, id)
    .then((dbRes) => res.send(dbRes.rows[0].related))
    .catch((e) => console.error(e));
});

app.listen(port, () => {
  console.log(`Atelier Products listening at http://localhost:${port}`);
});

module.exports = { app };
