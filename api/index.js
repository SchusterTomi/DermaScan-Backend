const express = require('express');
require('dotenv').config();
const cors = require('cors');
const pool = require('./db');
const imagenRoutes = require('./routes/imagen.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/imagen", imagenRoutes);

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Conectado!', hora: result.rows[0].now });
  } catch (err) {
    console.error('Error en /api/test-db:', err);
    res.status(500).json({ status: 'Error al conectar con la base de datos' });
  }
});

module.exports = app;
