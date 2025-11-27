// IMPORTACIONES
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('../cloudinary');
const pool = require('./db');
require('dotenv').config();
const bcrypt = require('bcrypt');

const app = express();

// CORS CONFIG (SOLUCIÓN PARA VERCEL)
app.use(cors({
  origin: "*", // permitir el front local y deploy
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// MULTER
const upload = multer({ storage: multer.memoryStorage() });

// TEST DB
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Conectado!', hora: result.rows[0].now });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error DB' });
  }
});

// GUARDAR HISTORIAL (POST) (/api/historial)
app.post('/api/historial', async (req, res) => {
  try {
    const { perfil_id, imagen, lesiones, zona, fecha } = req.body;

    if (!perfil_id || !imagen || !lesiones) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

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


// OBTENER HISTORIAL (GET) (/api/historial/:perfil_id)
app.get('/api/historial/:perfil_id', async (req, res) => {
  const { perfil_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, imagen, zona, lesiones, fecha FROM historial WHERE perfil_id = $1 ORDER BY fecha DESC',
      [perfil_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener historial:', err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// REGISTRO DE USUARIO (POST)(/api/registro)
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
      [nombre_completo, correo_electronico, hashedPassword, telefono || null]
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

// LOGIN DE USUARIO (POST)(/api/login)
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
      nombre_completo: perfil.nombre_completo,
      telefono: perfil.telefono,
      correo_electronico: perfil.correo_electronico
    });
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

/*
 // ACTUALIZAR PERFIL (PUT)(/api/perfil/update)
app.put('/api/perfil/update', async (req, res) => {
  const { perfil_id, nombre_completo, correo_electronico, telefono } = req.body;

  if (!perfil_id) {
    return res.status(400).json({ error: 'perfil_id requerido' });
  }

  try {
    const result = await pool.query(
      `UPDATE perfiles 
       SET nombre_completo = COALESCE($1, nombre_completo),
           correo_electronico = COALESCE($2, correo_electronico),
           telefono = COALESCE($3, telefono)
       WHERE id = $4
       RETURNING id, nombre_completo, correo_electronico, telefono`,
      [nombre_completo, correo_electronico, telefono, perfil_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json({
      mensaje: 'Perfil actualizado correctamente',
      perfil: result.rows[0]
    });
  } catch (err) {
    console.error('Error al actualizar perfil:', err.message);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});
*/

// EXPORTAR
module.exports = app;

// RUTA PARA CREAR PACIENTES (COMENTADA)

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


