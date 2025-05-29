const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba para verificar conexión a la base de datos
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Conectado!', hora: result.rows[0].now });
  } catch (err) {
    console.error('Error en /test-db:', err);
    res.status(500).json({ status: 'Error al conectar con la base de datos' });
  }
});

// Puerto donde corre el servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
