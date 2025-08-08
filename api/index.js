// IMPORTACIONES
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('../cloudinary');
const pool = require('./db');
require('dotenv').config();

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE MULTER
const upload = multer({ storage: multer.memoryStorage() });

// Ruta para testear la DB

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Conectado!', hora: result.rows[0].now });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error DB' });
   }
 });


// Subida de imagen a Cloudinary, vinculada a perfil (POST)
app.post('/api/imagen/upload', upload.single('imagen'), async (req, res) => {
  try {
    const { perfil_id, zona, severidad } = req.body;

    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
    if (!perfil_id) return res.status(400).json({ error: 'Falta perfil_id' });

    const buffer = req.file.buffer;

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      async (err, result) => {
        if (err) {
          console.error('Error Cloudinary:', err);
          return res.status(500).json({ error: 'Error al subir imagen' });
        }

        const imageUrl = result.secure_url;

        try {
          await pool.query(
            `INSERT INTO historial (imagen, perfil_id, zona, severidad, fecha)
             VALUES ($1, $2, $3, $4, NOW())`,
            [imageUrl, perfil_id, zona, severidad]
          );

          res.status(201).json({
            mensaje: 'Imagen subida con datos extra',
            url: imageUrl
          });
        } catch (dbErr) {
          console.error('Error al guardar en historial:', dbErr);
          return res.status(500).json({ error: 'Error al guardar en DB' });
        }
      }
    );

    uploadStream.end(buffer);
  } catch (e) {
    console.error('Error general:', e);
    res.status(500).json({ error: e.message });
  }
});

// Busqueda de historial (GET)
app.get('/api/historial/:perfil_id', async (req, res) => {
  const { perfil_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, imagen, zona, severidad, fecha FROM historial WHERE perfil_id = $1 ORDER BY fecha DESC',
      [perfil_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// PARA VER ERROR (CHATGPT)
app.get('/api/historial/:perfil_id', async (req, res) => {
  const { perfil_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, imagen, zona, severidad, fecha FROM historial WHERE perfil_id = $1 ORDER BY fecha DESC',
      [perfil_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener historial:', err); // Esto ya está
    console.error('Detalle del error:', err.message);   // 👈 Agregá esto
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});


module.exports = app;

// ----------------------------------------
// RUTA PARA CREAR PACIENTES (COMENTADA)
// ----------------------------------------

/*
app.post('/api/paciente', async (req, res) => {
  try {
    const { nombre, apellido, dni, gmail } = req.body;

    if (!nombre || !apellido || !dni || !gmail) {
      return res.status(400).json({ error: 'Faltan datos del paciente' });
    }

    const result = await pool.query(
      'INSERT INTO pacientes (nombre, apellido, dni, gmail) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, apellido, dni, gmail]
    );

    res.status(201).json({ mensaje: 'Paciente guardado', paciente: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    console.error('Error al guardar paciente:', error);
    res.status(500).json({ error: 'Error al guardar paciente' });
  }
});
*/
