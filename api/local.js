const app = require('./index');
const express = require('express');

const port = 3000;

const server = express();
server.use((req, res) => app(req, res));

server.listen(port, () => {
  console.log(`Servidor local en http://localhost:${port}`);
});
