// IMPORTACIONES
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('../cloudinary');
const pool = require('./db');
require('dotenv').config();
const bcrypt = require('bcrypt'); // para el encriptado

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


// ✅ Guardar resultado de IA en historial
app.post('/api/historial', async (req, res) => {
  try {
    const { perfil_id, imagen, lesiones, zona, fecha } = req.body;

    // Validación básica
    if (!perfil_id || !imagen || !lesiones) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Guardar en Neon
    const result = await pool.query(
      `INSERT INTO historial (perfil_id, imagen, lesiones, zona, fecha)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [perfil_id, imagen, lesiones, zona, fecha]
    );

    res.status(201).json({
      mensaje: 'Historial guardado con éxito',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error guardando historial:', error);
    res.status(500).json({ error: 'Error en el servidor' });
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
    console.error('Error al obtener historial:', err); // Esto ya está
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// REGISTRO DE CUENTA
app.post('/api/registro', async (req, res) => {
  const { nombre_completo, correo_electronico, contrasena, telefono } = req.body;

  if (!nombre_completo || !correo_electronico || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const existe = await pool.query(
      'SELECT * FROM perfiles WHERE correo_electronico = $1',
      [correo_electronico]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const nuevo = await pool.query(
      `INSERT INTO perfiles (nombre_completo, correo_electronico, contrasena, telefono) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [nombre_completo, correo_electronico, hashedPassword, telefono || null] // 👈 si no lo mandan, guarda NULL
    );

    res.status(201).json({
      mensaje: 'Registro exitoso',
      perfil_id: nuevo.rows[0].id
    });
  } catch (err) {
    console.error('Error en registro:', err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// LOGIN DE CUENTA

app.post('/api/login', async (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  if (!correo_electronico || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM perfiles WHERE correo_electronico = $1',
      [correo_electronico]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const perfil = result.rows[0];

    const passwordValida = await bcrypt.compare(contrasena, perfil.contrasena);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      mensaje: 'Login exitoso',
      perfil_id: perfil.id,
      nombre_completo: perfil.nombre_completo
    });
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
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
