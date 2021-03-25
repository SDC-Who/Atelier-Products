const app = require('./app');
const address = ''

describe("Test the root path", () => {
  test("It should response the GET method", () => {
    return request()
      .get("/products")
      .then(response => {
        expect(response.statusCode).toBe(200);
      });
  });
});
// GET /products

// GET /products/:product_id

// GET /products/:product_id/styles

// GET /products/:product_id/related
