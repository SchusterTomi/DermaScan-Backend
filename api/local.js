const app = require('./index');
const express = require('express');

const port = 3000;

const handler = app; // Viene exportado como serverless(app)

const server = express();

server.use((req, res) => handler(req, res));

server.listen(port, () => {
  console.log(`Servidor local en http://localhost:${port}`);
});
