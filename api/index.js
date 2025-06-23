// IMPORTACIONES

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('../cloudinary');
const pool = require('./db');
require('dotenv').config();

const app = express();

//MIDDLEWARES

app.use(cors());
app.use(express.json());

// CONFIGURACION DE MULTER 

const upload = multer({ storage: multer.memoryStorage() });

// Ruta para testear la DB

//app.get('/api/test-db', async (req, res) => {
 // try {
 //   const result = await pool.query('SELECT NOW()');
  //  res.json({ status: 'Conectado!', hora: result.rows[0].now });
 // } catch (e) {
 //   console.error(e);
  //  res.status(500).json({ error: 'Error DB' });
  // }
// });


// FUNCIONALIDAD
// Subida de imagen a Cloudinary
app.post('/api/imagen/upload', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const buffer = req.file.buffer;
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (err, result) => {
        if (err) {
          console.error('Cloud error', err);
          return res.status(500).json({ error: err.message });
        }
        res.json({ url: result.secure_url });
      }
    );
    uploadStream.end(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = app;

// FUNCIONALIDAD 
// (CREAR PACIENTES)

app.post('/api/paciente', async (req, res) => {
  try {
    const { nombre, apellido, dni, gmail } = req.body;

    // Vemos si esta todo completo
    if (!nombre || !apellido || !dni || !gmail) {
      return res.status(400).json({ error: 'Faltan datos del paciente' });
    }

    // Insertamos el paciente y retornamos el registro insertado
    const result = await pool.query(
      'INSERT INTO pacientes (nombre, apellido, dni, gmail) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, apellido, dni, gmail]
    );

    res.status(201).json({ mensaje: 'Paciente guardado', paciente: result.rows[0] });
  } catch (error) {
    console.error('Error al guardar paciente:', error);
    res.status(500).json({ error: 'Error al guardar paciente' });
  }
});

// FUNCIONALIDAD
// (IMÁGENES)





module.exports = app;