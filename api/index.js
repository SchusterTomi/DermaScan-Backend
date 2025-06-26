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


//FUNCIONALIDAD
// (IMÁGEN)
const serverless = require('serverless-http');
app.post('/api/imagen/upload', upload.single('imagen'), async (req, res) => {
  try {
    const { paciente_id } = req.body;

    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
    if (!paciente_id) return res.status(400).json({ error: 'Falta paciente_id' });

    const buffer = req.file.buffer;

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      async (err, result) => {
        if (err) {
          console.error('Error Cloudinary:', err);
          return res.status(500).json({ error: 'Error al subir imagen' });
        }

        const imageUrl = result.secure_url;

        // Simulación de IA (REEMPLAZAR MAS TARDE POR LO DE CHITO)
        const opcionesSeveridad = ['Leve', 'Moderada', 'Grave'];
        const severidad = opcionesSeveridad[Math.floor(Math.random() * opcionesSeveridad.length)];

        try {
        // Tabla historial
          await pool.query(
            'INSERT INTO historial (imagen, severidad, paciente_id) VALUES ($1, $2, $3)',
            [imageUrl, severidad, paciente_id]
          );

          res.status(201).json({
            mensaje: 'Imagen subida, analizada y guardada',
            url: imageUrl,
            severidad: severidad
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

module.exports.handler = serverless(app);

// FUNCIONALIDAD 
// (CREAR PACIENTES)

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


