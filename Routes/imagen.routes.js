const express = require("express");
const multer = require("multer");
const { uploadImage } = require("../controllers/imagen.controllers");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta POST que recibe imagen
router.post("/upload", upload.single("imagen"), uploadImage);

module.exports = router;
