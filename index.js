const express = require('express');
const cors = require('cors');
const pool = require('./db');
const imagenRoutes = require('./routes/imagen.routes'); // <--- esta línea debe ir arriba, antes de usarla

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/imagen", imagenRoutes); // <--- ya podés usarla

// Ruta de prueba
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Conectado!', hora: result.rows[0].now });
  } catch (err) {
    console.error('Error en /test-db:', err);
    res.status(500).json({ status: 'Error al conectar con la base de datos' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
