// index.js
const express = require('express');
require('dotenv').config();
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const cloudinary = require('./cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta simple de test
app.get('/api/hola', (req, res) => {
  res.json({ mensaje: 'sprint1 🎉' });
});

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

// Subida de imagen a Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

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

