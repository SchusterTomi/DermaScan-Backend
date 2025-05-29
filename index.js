const express = require('express');
const pool = require('./db'); // 👈 conectamos con Neon

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/historial', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM historial');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los historial');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
