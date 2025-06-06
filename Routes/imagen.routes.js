const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();  // guardar en memoria para subir luego a Cloudinary
const upload = multer({ storage });

const { uploadImage } = require('../controllers/imagen.controllers');

router.post('/upload', upload.single('imagen'), uploadImage);

module.exports = router;
