const express = require('express');
const app = express();
app.use(express.json()); // Para leer JSON en los POST

// Ruta simple
app.get('/', (req, res) => {
  res.send("¡Tu backend anda!");
});

// Ruta para crear paciente
app.post('/paciente', (req, res) => {
  const { nombre, edad, historial } = req.body;
  // Acá después lo vamos a guardar en la base de datos
  res.send(`Paciente ${nombre} creado (simulado)`);
});

// Ruta para traer datos de un paciente
app.get('/paciente/:id', (req, res) => {
  const id = req.params.id;
  // Después vamos a buscarlo en la base de datos
  res.send(`Buscando datos del paciente con ID: ${id} (simulado)`);
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
