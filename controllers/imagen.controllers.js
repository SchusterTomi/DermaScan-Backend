const { subirImagenACloudinary } = require("../utils/cdnFunctions");

const uploadImage = async (req, res) => {
  try {
    // Validar que exista la imagen
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen." });
    }

    const imageUrl = await subirImagenACloudinary(req.file.buffer);

    // Aca podrías guardar imageUrl en tu base de datos si querés

    res.json({ url: imageUrl });
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
};

module.exports = { uploadImage };
