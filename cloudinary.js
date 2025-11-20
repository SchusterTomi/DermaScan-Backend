const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // Importa las variables de entorno

// ❌ NO logueamos las credenciales
// console.log("Cloudinary config:", { ... });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
