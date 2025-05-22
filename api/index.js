const { Hono } = require('hono');

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hola desde el backend de DermaScan!');
});

module.exports = app;
